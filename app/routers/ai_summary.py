from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import func, text
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from typing import List
from datetime import date, datetime
import openai

from app.core.exceptions import AIGenerationError
from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.ai_summary import DailySummary
from app.schemas.ai_summary import DailySummaryCreate, DailySummaryEdit, DailySummaryResponse
from app.services.ai_summary import generate_daily_summary
from app.utils.notifications import notify_family_members
from app.utils.rate_limit import RateLimiter
from app.utils.timezone import get_jst_today
from app.core import constants
from app.utils.s3 import extract_object_key, delete_s3_objects


def acquire_ai_summary_lock(db: Session, baby_id: int, summary_date: date) -> None:
    """
    pg_advisory_xact_lock を使って (baby_id, summary_date) の組み合わせに対する
    排他ロックをトランザクション内で取得する。

    ロックキーは 64-bit 整数 2 つ（baby_id, date を YYYYMMDD 整数に変換）で構成する。
    トランザクション終了時に自動解放されるため明示的な解放は不要。
    """
    date_int = int(summary_date.strftime("%Y%m%d"))
    db.execute(
        text("SELECT pg_advisory_xact_lock(:key1, :key2)"),
        {"key1": baby_id, "key2": date_int},
    )

daily_summary_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_AI_SUMMARY_REQUESTS,
    time_window=constants.RATE_LIMIT_AI_SUMMARY_WINDOW,
    error_message="Too many daily summary requests. Please try again later.",
)

router = APIRouter(prefix="/api/babies/{baby_id}/daily-summary", tags=["daily-summary"])


@router.post("", response_model=DailySummaryResponse, status_code=status.HTTP_201_CREATED)
def create_or_get_daily_summary(
    baby_id: int,
    body: DailySummaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """日誌を生成（upsert）。is_edited=True なら既存をそのまま返す。"""
    baby = verify_baby_access(db, baby_id, current_user.id, require_write=True)

    # 未来日付チェック（JST基準）
    today_jst = get_jst_today()
    if body.summary_date > today_jst:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未来の日付では日誌を生成できません。",
        )

    # (baby_id, summary_date) への競合書き込みを防ぐ排他ロックを取得。
    # 同一キーへの並行リクエストはここでブロックされ、先行トランザクション完了後に
    # 順次処理される（UniqueViolation / SerializationFailure を回避）。
    acquire_ai_summary_lock(db, baby_id, body.summary_date)

    existing = (
        db.query(DailySummary)
        .filter(
            DailySummary.baby_id == baby_id,
            DailySummary.summary_date == body.summary_date,
        )
        .first()
    )

    # 編集済みの場合は再生成せず既存を返す（AI呼び出し不要のためレート制限も不要）
    if existing and existing.is_edited:
        return existing

    # AIエンドポイントへのDoS攻撃や、OpenAI APIの課金コスト枯渇を防ぐためのレート制限
    # 実際にAI生成が必要な場合のみチェックする
    daily_summary_limiter.check(f"user_{current_user.id}")

    try:
        generated_content, model_name = generate_daily_summary(
            db, baby_id, baby, body.summary_date
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AIGenerationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except openai.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI日誌生成の利用上限に達しました。しばらく時間をおいてから再試行してください。",
        )
    except openai.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AIサービスでエラーが発生しました。時間をおいて再試行してください。",
        )

    if existing:
        existing.generated_content = generated_content
        existing.model_name = model_name
        existing.user_id = current_user.id
        db.commit()
        db.refresh(existing)
        
        # 家族に通知
        notify_family_members(
            db, 
            baby.family_id, 
            current_user.id, 
            title="AI日誌の更新", 
            body=f"{baby.name}の{body.summary_date}のAI日誌が更新されました。",
            url=f"/diary",
            category="daily_summary"
        )
        
        return existing

    summary = DailySummary(
        baby_id=baby_id,
        user_id=current_user.id,
        summary_date=body.summary_date,
        generated_content=generated_content,
        is_edited=False,
        model_name=model_name,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    
    # 家族に通知
    notify_family_members(
        db, 
        baby.family_id, 
        current_user.id, 
        title="AI日誌の完成", 
        body=f"{baby.name}の{body.summary_date}のAI日誌が生成されました。",
        url=f"/diary",
        category="daily_summary"
    )
    
    return summary


@router.get("", response_model=List[DailySummaryResponse])
def list_daily_summaries(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """直近30件を降順で返す。"""
    verify_baby_access(db, baby_id, current_user.id)
    return (
        db.query(DailySummary)
        .filter(DailySummary.baby_id == baby_id)
        .order_by(DailySummary.summary_date.desc())
        .limit(30)
        .all()
    )


@router.get("/{summary_date}", response_model=DailySummaryResponse)
def get_daily_summary(
    baby_id: int,
    summary_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """指定日の日誌を取得。"""
    verify_baby_access(db, baby_id, current_user.id)
    summary = (
        db.query(DailySummary)
        .filter(
            DailySummary.baby_id == baby_id,
            DailySummary.summary_date == summary_date,
        )
        .first()
    )
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily summary not found")
    return summary


@router.patch("/{summary_date}", response_model=DailySummaryResponse)
def edit_daily_summary(
    baby_id: int,
    summary_date: date,
    body: DailySummaryEdit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """手動編集。edited_content=null でリセット（is_edited=False に戻す）。"""
    verify_baby_access(db, baby_id, current_user.id, require_write=True)
    summary = (
        db.query(DailySummary)
        .filter(
            DailySummary.baby_id == baby_id,
            DailySummary.summary_date == summary_date,
        )
        .first()
    )
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily summary not found")

    if summary.updated_at.replace(tzinfo=None) != body.updated_at.replace(tzinfo=None):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Data has been modified by another user.")

    summary.edited_content = body.edited_content
    summary.is_edited = body.edited_content is not None
    if body.image_urls is not None:
        summary.image_urls = [extract_object_key(url) for url in body.image_urls]
    db.commit()
    db.refresh(summary)
    return summary


@router.delete("/{summary_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_summary(
    baby_id: int,
    summary_date: date,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """指定日の日誌を削除。"""
    verify_baby_access(db, baby_id, current_user.id, require_write=True)
    summary = (
        db.query(DailySummary)
        .filter(
            DailySummary.baby_id == baby_id,
            DailySummary.summary_date == summary_date,
        )
        .first()
    )
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily summary not found")

    image_urls = list(summary.image_urls or [])

    summary.is_deleted = True
    db.commit()

    if image_urls:
        background_tasks.add_task(delete_s3_objects, image_urls)

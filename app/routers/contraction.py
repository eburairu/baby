from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import timezone, timedelta

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.contraction import Contraction
from app.schemas.contraction import ContractionCreate, ContractionResponse

router = APIRouter(prefix="/api/contractions", tags=["contractions"])

JST = timezone(timedelta(hours=9))
_MAX_INTERVAL_SECONDS = 3600  # 1時間超は新セッションとして扱わない


@router.get("/", response_model=List[ContractionResponse])
def get_contractions(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id)
    return db.query(Contraction).filter(Contraction.baby_id == baby_id).order_by(Contraction.start_time.desc()).all()


def _calculate_interval_seconds(current_start: object, last_start: object) -> int | None:
    """前回の start_time から今回の start_time までの秒数を計算する（start-to-start）。"""
    # DB から取得した timezone-naive datetime に合わせて比較
    if hasattr(current_start, "tzinfo") and current_start.tzinfo is not None:
        current_start = current_start.astimezone(JST).replace(tzinfo=None)
    diff = round((current_start - last_start).total_seconds())
    if diff <= 0 or diff >= _MAX_INTERVAL_SECONDS:
        return None
    return diff


@router.post("/", response_model=ContractionResponse)
def create_contraction(contraction_in: ContractionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, contraction_in.baby_id, current_user.id)

    # interval_seconds をサーバーサイドで計算（SWRキャッシュの古さに依存しない）
    last = (
        db.query(Contraction)
        .filter(Contraction.baby_id == contraction_in.baby_id)
        .order_by(Contraction.start_time.desc())
        .first()
    )
    interval_seconds = _calculate_interval_seconds(contraction_in.start_time, last.start_time) if last else None

    new_contraction = Contraction(
        user_id=current_user.id,
        baby_id=contraction_in.baby_id,
        start_time=contraction_in.start_time,
        end_time=contraction_in.end_time,
        duration_seconds=contraction_in.duration_seconds,
        interval_seconds=interval_seconds,
        notes=contraction_in.notes,
    )
    db.add(new_contraction)
    db.commit()
    db.refresh(new_contraction)
    return new_contraction


@router.delete("/{contraction_id}")
def delete_contraction(contraction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contraction = db.query(Contraction).filter(Contraction.id == contraction_id).first()
    if not contraction:
        raise HTTPException(status_code=404, detail="Contraction record not found")
    verify_baby_access(db, contraction.baby_id, current_user.id)
    db.delete(contraction)
    db.commit()
    return {"message": "Deleted"}

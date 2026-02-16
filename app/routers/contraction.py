from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import timezone, timedelta

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.contraction import Contraction
from app.schemas.contraction import ContractionCreate, ContractionResponse, ContractionUpdate
from app.utils.timezone import to_jst_naive

router = APIRouter(prefix="/api/contractions", tags=["contractions"])

JST = timezone(timedelta(hours=9))
_MAX_INTERVAL_SECONDS = 3600  # 1時間超は新セッションとして扱わない


@router.get("/", response_model=List[ContractionResponse])
def get_contractions(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="contraction")
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
    verify_baby_access(db, contraction_in.baby_id, current_user.id, record_type="contraction", require_write=True)

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
        start_time=to_jst_naive(contraction_in.start_time),
        end_time=to_jst_naive(contraction_in.end_time),
        duration_seconds=contraction_in.duration_seconds,
        interval_seconds=interval_seconds,
        notes=contraction_in.notes,
    )
    db.add(new_contraction)
    db.commit()
    db.refresh(new_contraction)
    return new_contraction


@router.patch("/{contraction_id}", response_model=ContractionResponse)
def update_contraction(
    contraction_id: int,
    contraction_in: ContractionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contraction = db.query(Contraction).filter(Contraction.id == contraction_id).first()
    if not contraction:
        raise HTTPException(status_code=404, detail="Contraction record not found")
    verify_baby_access(db, contraction.baby_id, current_user.id, record_type="contraction", require_write=True)

    update_data = contraction_in.model_dump(exclude_unset=True)
    if "start_time" in update_data and update_data["start_time"]:
        update_data["start_time"] = to_jst_naive(update_data["start_time"])
    if "end_time" in update_data and update_data["end_time"]:
        update_data["end_time"] = to_jst_naive(update_data["end_time"])

    for field, value in update_data.items():
        setattr(contraction, field, value)

    # start_time または end_time が変更された場合に duration_seconds を再計算
    if contraction.start_time and contraction.end_time:
        if "start_time" in update_data or "end_time" in update_data:
            duration = round((contraction.end_time - contraction.start_time).total_seconds())
            contraction.duration_seconds = max(0, duration)

    # start_time が変更された場合に interval_seconds を再計算
    if "start_time" in update_data:
        # 1. 自身の interval_seconds (前の記録との差)
        prev_record = (
            db.query(Contraction)
            .filter(Contraction.baby_id == contraction.baby_id, Contraction.start_time < contraction.start_time)
            .order_by(Contraction.start_time.desc())
            .first()
        )
        contraction.interval_seconds = (
            _calculate_interval_seconds(contraction.start_time, prev_record.start_time)
            if prev_record
            else None
        )

        # 2. 次の記録の interval_seconds (自身との差)
        next_record = (
            db.query(Contraction)
            .filter(Contraction.baby_id == contraction.baby_id, Contraction.start_time > contraction.start_time)
            .filter(Contraction.id != contraction.id) # 自身を除外
            .order_by(Contraction.start_time.asc())
            .first()
        )
        if next_record:
            next_record.interval_seconds = _calculate_interval_seconds(next_record.start_time, contraction.start_time)

    db.commit()
    db.refresh(contraction)
    return contraction


@router.delete("/{contraction_id}")
def delete_contraction(contraction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contraction = db.query(Contraction).filter(Contraction.id == contraction_id).first()
    if not contraction:
        raise HTTPException(status_code=404, detail="Contraction record not found")
    verify_baby_access(db, contraction.baby_id, current_user.id, record_type="contraction", require_write=True)
    db.delete(contraction)
    db.commit()
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.contraction import Contraction
from app.models.comment import RecordComment
from app.schemas.contraction import ContractionCreate, ContractionResponse, ContractionUpdate
from app.utils.timezone import to_jst_naive, JST
from app.utils.notifications import notify_family_members
from app.models.baby import Baby

router = APIRouter(prefix="/api/contractions", tags=["contractions"])

_MAX_INTERVAL_SECONDS = 3600  # 1時間超は新セッションとして扱わない


def _build_contraction_response(record: Contraction, user_map: dict, comment_count_map: dict) -> ContractionResponse:
    r = ContractionResponse.model_validate(record)
    r.recorded_by_display_name = user_map.get(record.user_id)
    r.comment_count = comment_count_map.get(record.id, 0)
    return r


@router.get("/", response_model=List[ContractionResponse])
def get_contractions(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="contraction")
    records = db.query(Contraction).filter(Contraction.baby_id == baby_id).order_by(Contraction.start_time.desc()).all()
    record_ids = [r.id for r in records]
    comment_count_map: dict = {}
    if record_ids:
        rows = db.query(RecordComment.record_id, func.count(RecordComment.id).label("cnt")).filter(
            RecordComment.record_type == "contraction",
            RecordComment.record_id.in_(record_ids)
        ).group_by(RecordComment.record_id).all()
        comment_count_map = {row.record_id: row.cnt for row in rows}
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_contraction_response(r, user_map, comment_count_map) for r in records]


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

    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == new_contraction.baby_id).first()
    display_name = current_user.display_name or current_user.username
    if baby:
        notify_family_members(
            db,
            baby.family_id,
            current_user.id,
            title="陣痛タイマー",
            body=f"{display_name}さんが陣痛を計測しました。",
            url=f"/contraction?baby_id={baby.id}",
            category="family_record"
        )

    response = ContractionResponse.model_validate(new_contraction)
    response.recorded_by_display_name = display_name
    return response


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
    recorder = db.query(User).filter(User.id == contraction.user_id).first()
    response = ContractionResponse.model_validate(contraction)
    response.recorded_by_display_name = (recorder.display_name or recorder.username) if recorder else None
    return response


@router.delete("/{contraction_id}")
def delete_contraction(contraction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contraction = db.query(Contraction).filter(Contraction.id == contraction_id).first()
    if not contraction:
        raise HTTPException(status_code=404, detail="Contraction record not found")
    verify_baby_access(db, contraction.baby_id, current_user.id, record_type="contraction", require_write=True)
    
    from app.models.comment import RecordComment
    db.query(RecordComment).filter(
        RecordComment.record_type == "contraction",
        RecordComment.record_id == contraction_id
    ).update({"is_deleted": True}, synchronize_session=False)

    contraction.is_deleted = True
    db.commit()
    return {"message": "Deleted"}

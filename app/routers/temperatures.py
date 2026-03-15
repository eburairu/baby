from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.constants import MAX_PAGINATION_LIMIT

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.temperature import TemperatureRecord
from app.models.comment import RecordComment
from app.schemas.temperature import TemperatureCreate, TemperatureResponse, TemperatureUpdate
from app.utils.notifications import notify_family_members_bg, notify_achievements_bg
from app.models.baby import Baby
from app.achievements.checker import check_and_award_achievements
from app.schemas.achievement import UnlockedAchievementInfo

router = APIRouter(prefix="/api/temperatures", tags=["temperatures"])


def _build_response(
    record: TemperatureRecord, user_map: dict, comment_count_map: dict
) -> TemperatureResponse:
    r = TemperatureResponse.model_validate(record)
    r.recorded_by_display_name = user_map.get(record.user_id)
    r.comment_count = comment_count_map.get(record.id, 0)
    return r


@router.get("/", response_model=List[TemperatureResponse])
def get_temperatures(
    baby_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(MAX_PAGINATION_LIMIT, ge=1, le=MAX_PAGINATION_LIMIT),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="temperature")
    records = (
        db.query(TemperatureRecord)
        .filter(TemperatureRecord.baby_id == baby_id, TemperatureRecord.is_deleted == False)
        .order_by(TemperatureRecord.measured_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    record_ids = [r.id for r in records]
    comment_count_map: dict = {}
    if record_ids:
        rows = (
            db.query(RecordComment.record_id, func.count(RecordComment.id).label("cnt"))
            .filter(
                RecordComment.record_type == "temperature",
                RecordComment.record_id.in_(record_ids),
                RecordComment.is_deleted == False,
            )
            .group_by(RecordComment.record_id)
            .all()
        )
        comment_count_map = {row.record_id: row.cnt for row in rows}
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_response(r, user_map, comment_count_map) for r in records]


@router.post("/", response_model=TemperatureResponse)
def create_temperature(
    temp_in: TemperatureCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, temp_in.baby_id, current_user.id, record_type="temperature", require_write=True)
    record = TemperatureRecord(
        user_id=current_user.id,
        baby_id=temp_in.baby_id,
        measured_at=temp_in.measured_at,
        temperature=temp_in.temperature,
        method=temp_in.method,
        notes=temp_in.notes,
    )
    db.add(record)
    db.flush()

    unlocked = check_and_award_achievements(
        baby_id=record.baby_id,
        record_type="temperature",
        user_id=current_user.id,
        db=db,
        record=record,
    )
    db.commit()
    db.refresh(record)

    baby = db.query(Baby).filter(Baby.id == record.baby_id).first()
    display_name = current_user.display_name or current_user.username
    if baby:
        notify_family_members_bg(
            background_tasks,
            baby.family_id,
            current_user.id,
            title="体温の記録",
            body=f"{display_name}さんが{baby.name}の体温を記録しました（{record.temperature}°C）。",
            url=f"/temperature?baby_id={baby.id}",
            category="family_record",
        )
        if unlocked:
            notify_achievements_bg(background_tasks, baby.family_id, baby.name, baby.id, unlocked)

    response = TemperatureResponse.model_validate(record)
    response.recorded_by_display_name = display_name
    response.unlocked_achievements = [UnlockedAchievementInfo(**a) for a in unlocked]
    return response


@router.put("/{record_id}", response_model=TemperatureResponse)
def update_temperature(
    record_id: int,
    temp_in: TemperatureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(TemperatureRecord).filter(TemperatureRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Temperature record not found")
    verify_baby_access(db, record.baby_id, current_user.id, record_type="temperature", require_write=True)

    if temp_in.measured_at is not None:
        record.measured_at = temp_in.measured_at
    if temp_in.temperature is not None:
        record.temperature = temp_in.temperature
    if temp_in.method is not None:
        record.method = temp_in.method
    if temp_in.notes is not None:
        record.notes = temp_in.notes

    db.commit()
    db.refresh(record)
    recorder = db.query(User).filter(User.id == record.user_id).first()
    response = TemperatureResponse.model_validate(record)
    response.recorded_by_display_name = (recorder.display_name or recorder.username) if recorder else None
    return response


@router.delete("/{record_id}")
def delete_temperature(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(TemperatureRecord).filter(TemperatureRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Temperature record not found")
    verify_baby_access(db, record.baby_id, current_user.id, record_type="temperature", require_write=True)
    
    from app.models.comment import RecordComment
    db.query(RecordComment).filter(
        RecordComment.record_type == "temperature",
        RecordComment.record_id == record_id
    ).update({"is_deleted": True}, synchronize_session=False)

    record.is_deleted = True
    db.commit()
    return {"message": "Deleted"}

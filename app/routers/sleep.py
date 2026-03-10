from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.sleep import Sleep
from app.models.comment import RecordComment
from app.schemas.sleep import SleepCreate, SleepUpdate, SleepResponse
from app.utils.notifications import notify_family_members_bg, notify_achievements_bg
from app.models.baby import Baby
from app.achievements.checker import check_and_award_achievements
from app.schemas.achievement import UnlockedAchievementInfo

router = APIRouter(prefix="/api/sleeps", tags=["sleeps"])


def _build_sleep_response(record: Sleep, user_map: dict, comment_count_map: dict) -> SleepResponse:
    r = SleepResponse.model_validate(record)
    r.recorded_by_display_name = user_map.get(record.user_id)
    r.comment_count = comment_count_map.get(record.id, 0)
    return r


@router.get("/", response_model=List[SleepResponse])
def get_sleeps(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="sleep")
    records = db.query(Sleep).filter(Sleep.baby_id == baby_id).order_by(Sleep.start_time.desc()).all()
    record_ids = [r.id for r in records]
    comment_count_map: dict = {}
    if record_ids:
        rows = db.query(RecordComment.record_id, func.count(RecordComment.id).label("cnt")).filter(
            RecordComment.record_type == "sleep",
            RecordComment.record_id.in_(record_ids)
        ).group_by(RecordComment.record_id).all()
        comment_count_map = {row.record_id: row.cnt for row in rows}
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_sleep_response(r, user_map, comment_count_map) for r in records]


@router.post("/", response_model=SleepResponse)
def create_sleep(
    sleep_in: SleepCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, sleep_in.baby_id, current_user.id, record_type="sleep", require_write=True)
    new_sleep = Sleep(
        user_id=current_user.id,
        baby_id=sleep_in.baby_id,
        start_time=sleep_in.start_time,
        end_time=sleep_in.end_time,
        notes=sleep_in.notes,
    )
    db.add(new_sleep)
    db.flush()

    unlocked = check_and_award_achievements(
        baby_id=new_sleep.baby_id,
        record_type="sleep",
        user_id=current_user.id,
        db=db,
        record=new_sleep,
    )
    db.commit()
    db.refresh(new_sleep)

    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == new_sleep.baby_id).first()
    display_name = current_user.display_name or current_user.username
    if baby:
        notify_family_members_bg(
            background_tasks,
            baby.family_id,
            current_user.id,
            title="睡眠の記録",
            body=f"{display_name}さんが{baby.name}の睡眠を記録しました。",
            url=f"/sleep?baby_id={baby.id}",
            category="family_record"
        )
        if unlocked:
            notify_achievements_bg(background_tasks, baby.family_id, baby.name, baby.id, unlocked)

    response = SleepResponse.model_validate(new_sleep)
    response.recorded_by_display_name = display_name
    response.unlocked_achievements = [UnlockedAchievementInfo(**a) for a in unlocked]
    return response


@router.patch("/{sleep_id}", response_model=SleepResponse)
def update_sleep(sleep_id: int, sleep_update: SleepUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sleep = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not sleep:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    verify_baby_access(db, sleep.baby_id, current_user.id, record_type="sleep", require_write=True)
    
    if sleep_update.start_time is not None:
        sleep.start_time = sleep_update.start_time
    if sleep_update.end_time is not None:
        sleep.end_time = sleep_update.end_time
    if sleep_update.notes is not None:
        sleep.notes = sleep_update.notes
    db.commit()
    db.refresh(sleep)
    recorder = db.query(User).filter(User.id == sleep.user_id).first()
    response = SleepResponse.model_validate(sleep)
    response.recorded_by_display_name = (recorder.display_name or recorder.username) if recorder else None
    return response


@router.delete("/{sleep_id}")
def delete_sleep(sleep_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sleep = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not sleep:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    verify_baby_access(db, sleep.baby_id, current_user.id, record_type="sleep", require_write=True)
    
    from app.models.comment import RecordComment
    db.query(RecordComment).filter(
        RecordComment.record_type == "sleep",
        RecordComment.record_id == sleep_id
    ).update({"is_deleted": True}, synchronize_session=False)

    sleep.is_deleted = True
    db.commit()
    return {"message": "Deleted"}

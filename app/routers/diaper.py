from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.constants import MAX_PAGINATION_LIMIT

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.diaper import Diaper
from app.models.comment import RecordComment
from app.schemas.diaper import DiaperCreate, DiaperResponse, DiaperUpdate
from app.utils.notifications import notify_family_members_bg, notify_achievements_bg
from app.models.baby import Baby
from app.achievements.checker import check_and_award_achievements
from app.schemas.achievement import UnlockedAchievementInfo

router = APIRouter(prefix="/api/diapers", tags=["diapers"])


def _build_diaper_response(record: Diaper, user_map: dict, comment_count_map: dict) -> DiaperResponse:
    r = DiaperResponse.model_validate(record)
    r.recorded_by_display_name = user_map.get(record.user_id)
    r.comment_count = comment_count_map.get(record.id, 0)
    return r


@router.get("/", response_model=List[DiaperResponse])
def get_diapers(
    baby_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(MAX_PAGINATION_LIMIT, ge=1, le=MAX_PAGINATION_LIMIT),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, record_type="diaper")
    records = db.query(Diaper).filter(Diaper.baby_id == baby_id, Diaper.is_deleted == False).order_by(Diaper.change_time.desc()).offset(skip).limit(limit).all()
    record_ids = [r.id for r in records]
    comment_count_map: dict = {}
    if record_ids:
        rows = db.query(RecordComment.record_id, func.count(RecordComment.id).label("cnt")).filter(
            RecordComment.record_type == "diaper",
            RecordComment.record_id.in_(record_ids),
            RecordComment.is_deleted == False
        ).group_by(RecordComment.record_id).all()
        comment_count_map = {row.record_id: row.cnt for row in rows}
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_diaper_response(r, user_map, comment_count_map) for r in records]


@router.post("/", response_model=DiaperResponse)
def create_diaper(
    diaper_in: DiaperCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, diaper_in.baby_id, current_user.id, record_type="diaper", require_write=True)
    new_diaper = Diaper(
        user_id=current_user.id,
        baby_id=diaper_in.baby_id,
        change_time=diaper_in.change_time,
        diaper_type=diaper_in.diaper_type,
        notes=diaper_in.notes,
    )
    db.add(new_diaper)
    db.flush()

    # 実績チェック（コミット前にflushしたレコードを使う）
    unlocked = check_and_award_achievements(
        baby_id=new_diaper.baby_id,
        record_type="diaper",
        user_id=current_user.id,
        db=db,
        record=new_diaper,
    )
    db.commit()
    db.refresh(new_diaper)

    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == new_diaper.baby_id).first()
    display_name = current_user.display_name or current_user.username
    if baby:
        notify_family_members_bg(
            background_tasks,
            baby.family_id,
            current_user.id,
            title="オムツの記録",
            body=f"{display_name}さんが{baby.name}のオムツを替えました。",
            url=f"/diaper?baby_id={baby.id}",
            category="family_record"
        )
        if unlocked:
            notify_achievements_bg(background_tasks, baby.family_id, baby.name, baby.id, unlocked)

    response = DiaperResponse.model_validate(new_diaper)
    response.recorded_by_display_name = display_name
    response.unlocked_achievements = [UnlockedAchievementInfo(**a) for a in unlocked]
    return response


@router.delete("/{diaper_id}")
def delete_diaper(diaper_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    diaper = db.query(Diaper).filter(Diaper.id == diaper_id).first()
    if not diaper:
        raise HTTPException(status_code=404, detail="Diaper record not found")
    verify_baby_access(db, diaper.baby_id, current_user.id, record_type="diaper", require_write=True)
    
    from app.models.comment import RecordComment
    db.query(RecordComment).filter(
        RecordComment.record_type == "diaper",
        RecordComment.record_id == diaper_id
    ).update({"is_deleted": True}, synchronize_session=False)

    diaper.is_deleted = True
    db.commit()
    return {"message": "Deleted"}


@router.put("/{diaper_id}", response_model=DiaperResponse)
def update_diaper(diaper_id: int, diaper_in: DiaperUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    diaper = db.query(Diaper).filter(Diaper.id == diaper_id).first()
    if not diaper:
        raise HTTPException(status_code=404, detail="Diaper record not found")
    verify_baby_access(db, diaper.baby_id, current_user.id, record_type="diaper", require_write=True)

    if diaper_in.change_time:
        diaper.change_time = diaper_in.change_time
    if diaper_in.diaper_type:
        diaper.diaper_type = diaper_in.diaper_type
    if diaper_in.notes is not None:
        diaper.notes = diaper_in.notes

    db.commit()
    db.refresh(diaper)
    recorder = db.query(User).filter(User.id == diaper.user_id).first()
    response = DiaperResponse.model_validate(diaper)
    response.recorded_by_display_name = (recorder.display_name or recorder.username) if recorder else None
    return response

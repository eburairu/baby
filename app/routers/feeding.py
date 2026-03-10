from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.feeding import Feeding, FeedingType
from app.models.comment import RecordComment
from app.schemas.feeding import FeedingCreate, FeedingResponse, FeedingUpdate
from app.utils.timezone import JST
from app.utils.notifications import notify_family_members_bg
from app.models.baby import Baby

router = APIRouter(prefix="/api/feedings", tags=["feedings"])


def _build_feeding_response(record: Feeding, user_map: dict, comment_count_map: dict) -> FeedingResponse:
    r = FeedingResponse.model_validate(record)
    r.recorded_by_display_name = user_map.get(record.user_id)
    r.comment_count = comment_count_map.get(record.id, 0)
    return r


@router.get("/", response_model=List[FeedingResponse])
def get_feedings(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="feeding")
    records = db.query(Feeding).filter(Feeding.baby_id == baby_id).order_by(Feeding.feeding_time.desc()).all()
    record_ids = [r.id for r in records]
    comment_count_map: dict = {}
    if record_ids:
        rows = db.query(RecordComment.record_id, func.count(RecordComment.id).label("cnt")).filter(
            RecordComment.record_type == "feeding",
            RecordComment.record_id.in_(record_ids)
        ).group_by(RecordComment.record_id).all()
        comment_count_map = {row.record_id: row.cnt for row in rows}
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_feeding_response(r, user_map, comment_count_map) for r in records]


@router.post("/", response_model=FeedingResponse)
def create_feeding(
    feeding_in: FeedingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, feeding_in.baby_id, current_user.id, record_type="feeding", require_write=True)
    new_feeding = Feeding(
        user_id=current_user.id,
        baby_id=feeding_in.baby_id,
        feeding_time=feeding_in.feeding_time,
        feeding_type=feeding_in.feeding_type,
        amount_ml=feeding_in.amount_ml,
        duration_minutes=feeding_in.duration_minutes,
        notes=feeding_in.notes,
        left_breast_minutes=feeding_in.left_breast_minutes,
        right_breast_minutes=feeding_in.right_breast_minutes,
        last_breast_side=feeding_in.last_breast_side,
        bottle_content_type=feeding_in.bottle_content_type,
        feeding_completion=feeding_in.feeding_completion,
        burped=feeding_in.burped,
    )
    db.add(new_feeding)
    db.commit()
    db.refresh(new_feeding)

    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == new_feeding.baby_id).first()
    display_name = current_user.display_name or current_user.username
    if baby:
        notify_family_members_bg(
            background_tasks,
            baby.family_id,
            current_user.id,
            title="授乳の記録",
            body=f"{display_name}さんが{baby.name}の授乳を記録しました。",
            url=f"/feeding?baby_id={baby.id}",
            category="family_record"
        )

    response = FeedingResponse.model_validate(new_feeding)
    response.recorded_by_display_name = display_name
    return response


@router.patch("/{feeding_id}", response_model=FeedingResponse)
def update_feeding(
    feeding_id: int,
    feeding_in: FeedingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    feeding = db.query(Feeding).filter(Feeding.id == feeding_id).first()
    if not feeding:
        raise HTTPException(status_code=404, detail="Feeding record not found")
    verify_baby_access(db, feeding.baby_id, current_user.id, record_type="feeding", require_write=True)

    update_data = feeding_in.model_dump(exclude_unset=True)

    # 授乳タイプが変更された場合、不要になった項目を明示的にクリアする
    if "feeding_type" in update_data:
        new_type = update_data["feeding_type"]
        if new_type == FeedingType.BREAST:
            # 母乳に変更された場合、ボトル関連をクリア
            feeding.amount_ml = None
            feeding.bottle_content_type = None
        elif new_type == FeedingType.BOTTLE:
            # ボトルに変更された場合、母乳関連をクリア
            feeding.left_breast_minutes = None
            feeding.right_breast_minutes = None
            feeding.last_breast_side = None
            feeding.duration_minutes = None

    if "feeding_time" in update_data and update_data["feeding_time"]:
        update_data["feeding_time"] = update_data["feeding_time"]

    for field, value in update_data.items():
        setattr(feeding, field, value)

    db.commit()
    db.refresh(feeding)
    recorder = db.query(User).filter(User.id == feeding.user_id).first()
    response = FeedingResponse.model_validate(feeding)
    response.recorded_by_display_name = (recorder.display_name or recorder.username) if recorder else None
    return response


@router.delete("/{feeding_id}")
def delete_feeding(feeding_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feeding = db.query(Feeding).filter(Feeding.id == feeding_id).first()
    if not feeding:
        raise HTTPException(status_code=404, detail="Feeding not found")
    verify_baby_access(db, feeding.baby_id, current_user.id, record_type="feeding", require_write=True)
    db.query(RecordComment).filter(
        RecordComment.record_type == "feeding",
        RecordComment.record_id == feeding_id
    ).update({"is_deleted": True}, synchronize_session=False)
    
    feeding.is_deleted = True
    db.commit()
    return {"message": "Deleted"}

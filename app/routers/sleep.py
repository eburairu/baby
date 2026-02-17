from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.sleep import Sleep
from app.models.comment import RecordComment
from app.schemas.sleep import SleepCreate, SleepUpdate, SleepResponse
from app.utils.timezone import to_jst_naive
from app.utils.notifications import notify_family_members
from app.models.baby import Baby

router = APIRouter(prefix="/api/sleeps", tags=["sleeps"])


@router.get("/", response_model=List[SleepResponse])
def get_sleeps(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="sleep")
    return db.query(Sleep).filter(Sleep.baby_id == baby_id).order_by(Sleep.start_time.desc()).all()


@router.post("/", response_model=SleepResponse)
def create_sleep(sleep_in: SleepCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, sleep_in.baby_id, current_user.id, record_type="sleep", require_write=True)
    new_sleep = Sleep(
        user_id=current_user.id,
        baby_id=sleep_in.baby_id,
        start_time=to_jst_naive(sleep_in.start_time),
        end_time=to_jst_naive(sleep_in.end_time),
        notes=sleep_in.notes,
    )
    db.add(new_sleep)
    db.commit()
    db.refresh(new_sleep)
    
    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == new_sleep.baby_id).first()
    if baby:
        display_name = current_user.display_name or current_user.username
        notify_family_members(
            db, 
            baby.family_id, 
            current_user.id, 
            title="睡眠の記録", 
            body=f"{display_name}さんが{baby.name}の睡眠を記録しました。",
            url=f"/sleep",
            category="family_record"
        )
        
    return new_sleep


@router.patch("/{sleep_id}", response_model=SleepResponse)
def update_sleep(sleep_id: int, sleep_update: SleepUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sleep = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not sleep:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    verify_baby_access(db, sleep.baby_id, current_user.id, record_type="sleep", require_write=True)
    
    if sleep_update.start_time is not None:
        sleep.start_time = to_jst_naive(sleep_update.start_time)
    if sleep_update.end_time is not None:
        sleep.end_time = to_jst_naive(sleep_update.end_time)
    if sleep_update.notes is not None:
        sleep.notes = sleep_update.notes
    db.commit()
    db.refresh(sleep)
    return sleep


@router.delete("/{sleep_id}")
def delete_sleep(sleep_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sleep = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    if not sleep:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    verify_baby_access(db, sleep.baby_id, current_user.id, record_type="sleep", require_write=True)
    db.query(RecordComment).filter(
        RecordComment.record_type == "sleep",
        RecordComment.record_id == sleep_id
    ).delete()
    db.delete(sleep)
    db.commit()
    return {"message": "Deleted"}

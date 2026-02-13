from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleResponse

router = APIRouter(prefix="/api/schedules", tags=["schedules"])


@router.get("/", response_model=List[ScheduleResponse])
def get_schedules(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id)
    return db.query(Schedule).filter(Schedule.baby_id == baby_id).order_by(Schedule.scheduled_time).all()


@router.post("/", response_model=ScheduleResponse)
def create_schedule(schedule_in: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, schedule_in.baby_id, current_user.id)
    new_schedule = Schedule(
        user_id=current_user.id,
        baby_id=schedule_in.baby_id,
        title=schedule_in.title,
        description=schedule_in.description,
        scheduled_time=schedule_in.scheduled_time,
        is_completed=schedule_in.is_completed,
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule


@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    verify_baby_access(db, schedule.baby_id, current_user.id)
    db.delete(schedule)
    db.commit()
    return {"message": "Deleted"}

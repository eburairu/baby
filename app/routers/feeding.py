from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.feeding import Feeding
from app.schemas.feeding import FeedingCreate, FeedingResponse, FeedingUpdate

router = APIRouter(prefix="/api/feedings", tags=["feedings"])


@router.get("/", response_model=List[FeedingResponse])
def get_feedings(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="feeding")
    return db.query(Feeding).filter(Feeding.baby_id == baby_id).order_by(Feeding.feeding_time.desc()).all()


@router.post("/", response_model=FeedingResponse)
def create_feeding(feeding_in: FeedingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, feeding_in.baby_id, current_user.id, record_type="feeding", require_write=True)
    new_feeding = Feeding(
        user_id=current_user.id,
        baby_id=feeding_in.baby_id,
        feeding_time=feeding_in.feeding_time,
        feeding_type=feeding_in.feeding_type,
        amount_ml=feeding_in.amount_ml,
        duration_minutes=feeding_in.duration_minutes,
        notes=feeding_in.notes,
    )
    db.add(new_feeding)
    db.commit()
    db.refresh(new_feeding)
    return new_feeding


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
    for field, value in update_data.items():
        setattr(feeding, field, value)

    db.commit()
    db.refresh(feeding)
    return feeding


@router.delete("/{feeding_id}")
def delete_feeding(feeding_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feeding = db.query(Feeding).filter(Feeding.id == feeding_id).first()
    if not feeding:
        raise HTTPException(status_code=404, detail="Feeding not found")
    verify_baby_access(db, feeding.baby_id, current_user.id, record_type="feeding", require_write=True)
    db.delete(feeding)
    db.commit()
    return {"message": "Deleted"}

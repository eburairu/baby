from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.growth import Growth
from app.schemas.growth import GrowthCreate, GrowthResponse

router = APIRouter(prefix="/api/growths", tags=["growths"])


@router.get("/", response_model=List[GrowthResponse])
def get_growths(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Growth).filter(Growth.baby_id == baby_id).order_by(Growth.measurement_date.desc()).all()


@router.post("/", response_model=GrowthResponse)
def create_growth(growth_in: GrowthCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_growth = Growth(
        user_id=current_user.id,
        baby_id=growth_in.baby_id,
        measurement_date=growth_in.measurement_date,
        weight_kg=growth_in.weight_kg,
        height_cm=growth_in.height_cm,
        head_circumference_cm=growth_in.head_circumference_cm,
        notes=growth_in.notes,
    )
    db.add(new_growth)
    db.commit()
    db.refresh(new_growth)
    return new_growth


@router.delete("/{growth_id}")
def delete_growth(growth_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    growth = db.query(Growth).filter(Growth.id == growth_id, Growth.user_id == current_user.id).first()
    if not growth:
        raise HTTPException(status_code=404, detail="Growth record not found")
    db.delete(growth)
    db.commit()
    return {"message": "Deleted"}

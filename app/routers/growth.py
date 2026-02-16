from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.growth import Growth
from app.schemas.growth import GrowthCreate, GrowthResponse, GrowthUpdate
from app.utils.timezone import to_jst_naive

router = APIRouter(prefix="/api/growths", tags=["growths"])


@router.get("/", response_model=List[GrowthResponse])
def get_growths(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, baby_id, current_user.id, record_type="growth")
    return db.query(Growth).filter(Growth.baby_id == baby_id).order_by(Growth.date.desc()).all()


@router.post("/", response_model=GrowthResponse)
def create_growth(growth_in: GrowthCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, growth_in.baby_id, current_user.id, record_type="growth", require_write=True)
    new_growth = Growth(
        user_id=current_user.id,
        baby_id=growth_in.baby_id,
        date=growth_in.date,
        weight=growth_in.weight,
        height=growth_in.height,
        head_circumference=growth_in.head_circumference,
        notes=growth_in.notes,
    )
    db.add(new_growth)
    db.commit()
    db.refresh(new_growth)
    return new_growth


@router.put("/{growth_id}", response_model=GrowthResponse)
def update_growth(
    growth_id: int,
    growth_in: GrowthUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    growth = db.query(Growth).filter(Growth.id == growth_id).first()
    if not growth:
        raise HTTPException(status_code=404, detail="Growth record not found")
    verify_baby_access(db, growth.baby_id, current_user.id, record_type="growth", require_write=True)

    update_data = growth_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(growth, field, value)

    db.commit()
    db.refresh(growth)
    return growth


@router.delete("/{growth_id}")
def delete_growth(growth_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    growth = db.query(Growth).filter(Growth.id == growth_id).first()
    if not growth:
        raise HTTPException(status_code=404, detail="Growth record not found")
    verify_baby_access(db, growth.baby_id, current_user.id, record_type="growth", require_write=True)
    db.delete(growth)
    db.commit()
    return {"message": "Deleted"}

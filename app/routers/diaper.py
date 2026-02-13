from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.diaper import Diaper
from app.schemas.diaper import DiaperCreate, DiaperResponse

router = APIRouter(prefix="/api/diapers", tags=["diapers"])


@router.get("/", response_model=List[DiaperResponse])
def get_diapers(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Diaper).filter(Diaper.baby_id == baby_id).order_by(Diaper.change_time.desc()).all()


@router.post("/", response_model=DiaperResponse)
def create_diaper(diaper_in: DiaperCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_diaper = Diaper(
        user_id=current_user.id,
        baby_id=diaper_in.baby_id,
        change_time=diaper_in.change_time,
        diaper_type=diaper_in.diaper_type,
        notes=diaper_in.notes,
    )
    db.add(new_diaper)
    db.commit()
    db.refresh(new_diaper)
    return new_diaper


@router.delete("/{diaper_id}")
def delete_diaper(diaper_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    diaper = db.query(Diaper).filter(Diaper.id == diaper_id, Diaper.user_id == current_user.id).first()
    if not diaper:
        raise HTTPException(status_code=404, detail="Diaper record not found")
    db.delete(diaper)
    db.commit()
    return {"message": "Deleted"}

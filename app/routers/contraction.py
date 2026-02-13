from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.contraction import Contraction
from app.schemas.contraction import ContractionCreate, ContractionResponse

router = APIRouter(prefix="/api/contractions", tags=["contractions"])


@router.get("/", response_model=List[ContractionResponse])
def get_contractions(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Contraction).filter(Contraction.baby_id == baby_id).order_by(Contraction.start_time.desc()).all()


@router.post("/", response_model=ContractionResponse)
def create_contraction(contraction_in: ContractionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_contraction = Contraction(
        user_id=current_user.id,
        baby_id=contraction_in.baby_id,
        start_time=contraction_in.start_time,
        end_time=contraction_in.end_time,
        duration_seconds=contraction_in.duration_seconds,
        interval_seconds=contraction_in.interval_seconds,
        notes=contraction_in.notes,
    )
    db.add(new_contraction)
    db.commit()
    db.refresh(new_contraction)
    return new_contraction


@router.delete("/{contraction_id}")
def delete_contraction(contraction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contraction = db.query(Contraction).filter(Contraction.id == contraction_id, Contraction.user_id == current_user.id).first()
    if not contraction:
        raise HTTPException(status_code=404, detail="Contraction record not found")
    db.delete(contraction)
    db.commit()
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.family import FamilyUser
from app.models.baby import Baby
from app.schemas.baby import BabyCreate, BabyResponse

router = APIRouter(prefix="/api/babies", tags=["babies"])


@router.get("/", response_model=List[BabyResponse])
def get_babies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        return []
    return db.query(Baby).filter(Baby.family_id == family_user.family_id).all()


@router.post("/", response_model=BabyResponse)
def create_baby(baby_in: BabyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
    if family_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can add babies")

    new_baby = Baby(
        family_id=family_user.family_id,
        name=baby_in.name,
        birthday=baby_in.birthday,
        due_date=baby_in.due_date,
    )
    db.add(new_baby)
    db.commit()
    db.refresh(new_baby)
    return new_baby

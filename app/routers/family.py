from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.schemas.family import FamilyResponse

router = APIRouter(prefix="/api/family", tags=["family"])


@router.get("/", response_model=FamilyResponse)
def get_family(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=404, detail="Family not found")
    family = db.query(Family).filter(Family.id == family_user.family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family

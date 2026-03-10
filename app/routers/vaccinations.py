from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.vaccination import Vaccination
from app.models.enums import VaccinationStatus
from app.models.baby import Baby
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate, VaccinationResponse
from app.services.vaccination_service import VaccinationService
from app.utils.rate_limit import RateLimiter
from app.core import constants

router = APIRouter(prefix="/api/vaccinations", tags=["vaccinations"])

vaccination_generate_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_VACCINATION_GENERATE_REQUESTS,
    time_window=constants.RATE_LIMIT_VACCINATION_GENERATE_WINDOW,
    error_message="Too many generation requests. Please try again later.",
)

@router.get("/", response_model=List[VaccinationResponse])
async def get_vaccinations(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, record_type="vaccination")
    return db.query(Vaccination).filter(Vaccination.baby_id == baby_id).order_by(Vaccination.scheduled_date.asc()).all()

@router.post("/", response_model=VaccinationResponse, status_code=status.HTTP_201_CREATED)
async def create_vaccination(
    baby_id: int,
    vaccination: VaccinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, require_write=True)
    db_vaccination = Vaccination(
        **vaccination.model_dump(),
        baby_id=baby_id,
        user_id=current_user.id
    )
    db.add(db_vaccination)
    db.commit()
    db.refresh(db_vaccination)
    return db_vaccination

@router.patch("/{vaccination_id}", response_model=VaccinationResponse)
async def update_vaccination(
    vaccination_id: int,
    vaccination_update: VaccinationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not db_vaccination:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    
    verify_baby_access(db, db_vaccination.baby_id, current_user.id, require_write=True)
    
    update_data = vaccination_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vaccination, key, value)
    
    db.commit()
    db.refresh(db_vaccination)
    return db_vaccination

@router.delete("/{vaccination_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vaccination(
    vaccination_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not db_vaccination:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    
    verify_baby_access(db, db_vaccination.baby_id, current_user.id, require_write=True)
    
    from app.models.comment import RecordComment
    db.query(RecordComment).filter(
        RecordComment.record_type == "vaccination",
        RecordComment.record_id == vaccination_id
    ).update({"is_deleted": True}, synchronize_session=False)

    db_vaccination.is_deleted = True
    db.commit()

@router.post("/generate", response_model=List[VaccinationResponse])
async def generate_vaccinations(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vaccination_generate_limiter.check(f"user_{current_user.id}")
    verify_baby_access(db, baby_id, current_user.id, require_write=True)
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if not baby or not baby.birthday:
        raise HTTPException(status_code=400, detail="Baby not found or birthday not set")
    
    # Check if already generated
    exists = db.query(Vaccination).filter(Vaccination.baby_id == baby_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Vaccination schedule already exists for this baby")
        
    return VaccinationService.generate_for_baby(db, baby_id, current_user.id, baby.birthday)

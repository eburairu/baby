from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.milestone import Milestone
from app.models.baby import Baby
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate, MilestoneResponse, MilestoneTimelineGroup
from datetime import date

router = APIRouter(prefix="/api/milestones", tags=["milestones"])

@router.get("/", response_model=List[MilestoneResponse])
async def get_milestones(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, record_type="milestone")
    return db.query(Milestone).filter(Milestone.baby_id == baby_id).order_by(Milestone.achieved_date.desc()).all()

@router.post("/", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    baby_id: int,
    milestone: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, require_write=True)
    db_milestone = Milestone(
        **milestone.model_dump(),
        baby_id=baby_id,
        user_id=current_user.id
    )
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.patch("/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: int,
    milestone_update: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    verify_baby_access(db, db_milestone.baby_id, current_user.id, require_write=True)
    
    update_data = milestone_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_milestone, key, value)
    
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    verify_baby_access(db, db_milestone.baby_id, current_user.id, require_write=True)
    
    db.delete(db_milestone)
    db.commit()

@router.get("/timeline", response_model=List[MilestoneTimelineGroup])
async def get_milestone_timeline(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, record_type="milestone")
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if not baby or not baby.birthday:
        raise HTTPException(status_code=400, detail="Baby not found or birthday not set")
    
    milestones = db.query(Milestone).filter(Milestone.baby_id == baby_id).order_by(Milestone.achieved_date.asc()).all()
    
    # Group by month age
    groups = {}
    for m in milestones:
        # Calculate month age: (year diff * 12) + month diff
        month_age = (m.achieved_date.year - baby.birthday.year) * 12 + (m.achieved_date.month - baby.birthday.month)
        if m.achieved_date.day < baby.birthday.day:
            month_age -= 1
        
        if month_age not in groups:
            groups[month_age] = []
        groups[month_age].append(m)
    
    result = []
    for month_age in sorted(groups.keys()):
        result.append({
            "month_age": month_age,
            "milestones": groups[month_age]
        })
    
    return result

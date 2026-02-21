from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import SessionLocal
from app.dependencies import get_db, get_current_superadmin
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.note import Note
from app.schemas.user import UserResponse, SuperAdminToggleRequest

router = APIRouter(prefix="/api/admin", tags=["admin"])

class AdminStats(BaseModel):
    total_users: int
    total_families: int
    total_records: int
    active_users_last_24h: int

class FamilyAdminResponse(BaseModel):
    id: int
    name: str
    member_count: int
    created_at: datetime

class UserAdminResponse(UserResponse):
    is_superadmin: bool

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    total_users = db.query(func.count(User.id)).scalar()
    total_families = db.query(func.count(Family.id)).scalar()
    
    # 記録の総計
    feeding_count = db.query(func.count(Feeding.id)).scalar()
    sleep_count = db.query(func.count(Sleep.id)).scalar()
    diaper_count = db.query(func.count(Diaper.id)).scalar()
    growth_count = db.query(func.count(Growth.id)).scalar()
    contraction_count = db.query(func.count(Contraction.id)).scalar()
    schedule_count = db.query(func.count(Schedule.id)).scalar()
    note_count = db.query(func.count(Note.id)).scalar()
    
    total_records = (
        feeding_count + sleep_count + diaper_count + 
        growth_count + contraction_count + schedule_count + note_count
    )
    
    # 24時間以内のアクティブユーザー（セッションベースまたは記録作成ベース）
    # ここでは簡易的に全ユーザー数を返す（将来的に拡張）
    active_users = total_users 

    return AdminStats(
        total_users=total_users,
        total_families=total_families,
        total_records=total_records,
        active_users_last_24h=active_users
    )

@router.get("/families", response_model=List[FamilyAdminResponse])
def get_admin_families(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin),
    skip: int = 0,
    limit: int = 100
):
    families = db.query(Family).offset(skip).limit(limit).all()
    result = []
    for f in families:
        member_count = db.query(func.count(FamilyUser.id)).filter(FamilyUser.family_id == f.id).scalar()
        result.append(FamilyAdminResponse(
            id=f.id,
            name=f.name,
            member_count=member_count,
            created_at=f.created_at
        ))
    return result

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin),
    skip: int = 0,
    limit: int = 100
):
    # UserResponse スキーマが is_superadmin を持っているのでそれを利用
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.patch("/users/{user_id}/superadmin", response_model=UserResponse)
def toggle_superadmin(
    user_id: int,
    request: SuperAdminToggleRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 自分自身の権限は剥奪できないようにする（安全のため）
    if user.id == admin.id and not request.is_superadmin:
        raise HTTPException(status_code=400, detail="Cannot demote yourself from SuperAdmin")
        
    user.is_superadmin = request.is_superadmin
    db.commit()
    db.refresh(user)
    return user

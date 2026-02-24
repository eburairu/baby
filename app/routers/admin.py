from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import logging
from app.core.constants import MAX_PAGINATION_LIMIT

from app.database import SessionLocal
from app.dependencies import get_db, get_current_superadmin
from app.models.user import User, UserSession
from app.models.family import Family, FamilyUser
from app.models.baby import Baby
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.note import Note
from app.schemas.user import UserResponse, SuperAdminToggleRequest

router = APIRouter(prefix="/api/admin", tags=["admin"])

logger = logging.getLogger(__name__)

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

class AdminFamilyMemberResponse(BaseModel):
    user_id: int
    username: str
    display_name: Optional[str] = None
    role: str
    joined_at: datetime

class BabyAdminResponse(BaseModel):
    id: int
    name: str
    birthday: Optional[str] = None
    gender: Optional[str] = None
    created_at: datetime

class FamilyDetailResponse(BaseModel):
    id: int
    name: str
    member_count: int
    created_at: datetime
    members: List[AdminFamilyMemberResponse]
    babies: List[BabyAdminResponse]

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

    # 24時間以内にセッションを作成したユニークユーザー数
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    active_users = db.query(func.count(func.distinct(UserSession.user_id))).filter(
        UserSession.created_at >= since
    ).scalar()

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
    limit: int = MAX_PAGINATION_LIMIT,
    search: Optional[str] = None
):
    query = db.query(Family)
    if search:
        query = query.filter(Family.name.ilike(f"%{search}%"))
    families = query.offset(skip).limit(limit).all()
    result = []
    for f in families:
        member_count = db.query(func.count(FamilyUser.user_id)).filter(FamilyUser.family_id == f.id).scalar()
        result.append(FamilyAdminResponse(
            id=f.id,
            name=f.name,
            member_count=member_count,
            created_at=f.created_at
        ))
    return result

@router.get("/families/{family_id}", response_model=FamilyDetailResponse)
def get_admin_family_detail(
    family_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    family_users = (
        db.query(FamilyUser)
        .options(joinedload(FamilyUser.user))
        .filter(FamilyUser.family_id == family_id)
        .all()
    )
    members = [
        AdminFamilyMemberResponse(
            user_id=fu.user.id,
            username=fu.user.username,
            display_name=fu.user.display_name,
            role=fu.role,
            joined_at=fu.joined_at
        )
        for fu in family_users
        if fu.user
    ]

    babies_db = db.query(Baby).filter(Baby.family_id == family_id).all()
    babies = [
        BabyAdminResponse(
            id=b.id,
            name=b.name,
            birthday=b.birthday.isoformat() if b.birthday else None,
            gender=b.gender,
            created_at=b.created_at
        )
        for b in babies_db
    ]

    return FamilyDetailResponse(
        id=family.id,
        name=family.name,
        member_count=len(members),
        created_at=family.created_at,
        members=members,
        babies=babies
    )

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin),
    skip: int = 0,
    limit: int = MAX_PAGINATION_LIMIT
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
    logger.info("SuperAdmin status updated: target_user_id=%s, new_status=%s, by admin_id=%s", user.id, request.is_superadmin, admin.id)
    return user

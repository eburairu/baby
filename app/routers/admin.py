from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import logging
import secrets
from app.core.constants import MAX_PAGINATION_LIMIT, RATE_LIMIT_ADMIN_REQUESTS, RATE_LIMIT_ADMIN_WINDOW

from app.database import SessionLocal
from app.dependencies import get_db, get_current_superadmin
from app.utils.rate_limit import RateLimiter
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
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse, SuperAdminToggleRequest
from app.schemas.admin import (
    AdminStats, 
    FamilyAdminResponse, 
    FamilyDetailResponse, 
    AdminFamilyMemberResponse, 
    BabyAdminResponse, 
    AuditLogResponse,
    FamilyCreateAdmin,
    FamilyCreateResponseAdmin
)
from app.utils.audit import log_event, get_client_ip

admin_action_limiter = RateLimiter(
    requests_limit=RATE_LIMIT_ADMIN_REQUESTS,
    time_window=RATE_LIMIT_ADMIN_WINDOW,
    error_message="Too many admin requests. Please try again later."
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

logger = logging.getLogger(__name__)

@router.get("/stats", response_model=AdminStats, dependencies=[Depends(admin_action_limiter)])
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    from app.config import SESSION_EXPIRE_DAYS
    # スライディングセッション延長後の expires_at を基準に直近24hのアクティブユーザーを算出。
    # セッションを24h以内に使ったユーザーは expires_at >= now + (SESSION_EXPIRE_DAYS - 1) days。
    active_threshold = datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRE_DAYS - 1)

    query = select(
        select(func.count(User.id)).scalar_subquery().label("total_users"),
        select(func.count(Family.id)).scalar_subquery().label("total_families"),
        select(func.count(Feeding.id)).scalar_subquery().label("feeding_count"),
        select(func.count(Sleep.id)).scalar_subquery().label("sleep_count"),
        select(func.count(Diaper.id)).scalar_subquery().label("diaper_count"),
        select(func.count(Growth.id)).scalar_subquery().label("growth_count"),
        select(func.count(Contraction.id)).scalar_subquery().label("contraction_count"),
        select(func.count(Schedule.id)).scalar_subquery().label("schedule_count"),
        select(func.count(Note.id)).scalar_subquery().label("note_count"),
        select(func.count(func.distinct(UserSession.user_id))).filter(UserSession.expires_at >= active_threshold).scalar_subquery().label("active_users"),
    )
    
    counts = db.execute(query).first()

    total_records = (
        counts.feeding_count + counts.sleep_count + counts.diaper_count +
        counts.growth_count + counts.contraction_count + counts.schedule_count + counts.note_count
    )

    return AdminStats(
        total_users=counts.total_users,
        total_families=counts.total_families,
        total_records=total_records,
        active_users_last_24h=counts.active_users
    )

@router.get("/families", response_model=List[FamilyAdminResponse], dependencies=[Depends(admin_action_limiter)])
def get_admin_families(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin),
    skip: int = Query(0, ge=0),
    limit: int = Query(MAX_PAGINATION_LIMIT, ge=1, le=MAX_PAGINATION_LIMIT),
    search: Optional[str] = Query(None, max_length=100)
):
    query = db.query(Family)
    if search:
        # Escape wildcard characters to prevent DoS and ensure literal search
        # Using backslash as escape character
        escaped_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.filter(Family.name.ilike(f"%{escaped_search}%", escape="\\"))
    families = query.offset(skip).limit(limit).all()

    # ⚡ Bolt: N+1クエリを防ぐため、全家族のメンバー数を1回のクエリで一括取得する
    family_ids = [f.id for f in families]
    member_counts = {}
    if family_ids:
        counts = db.query(
            FamilyUser.family_id,
            func.count(FamilyUser.user_id)
        ).filter(
            FamilyUser.family_id.in_(family_ids)
        ).group_by(
            FamilyUser.family_id
        ).all()
        member_counts = {family_id: count for family_id, count in counts}

    result = []
    for f in families:
        result.append(FamilyAdminResponse(
            id=f.id,
            name=f.name,
            member_count=member_counts.get(f.id, 0),
            created_at=f.created_at
        ))
    return result

@router.post("/families", response_model=FamilyCreateResponseAdmin, dependencies=[Depends(admin_action_limiter)])
def create_admin_family(
    family_in: FamilyCreateAdmin,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    if not family_in.name.strip():
        raise HTTPException(status_code=422, detail="Family name cannot be empty")

    invite_code = secrets.token_hex(8).upper()
    while db.query(Family).filter(Family.invite_code == invite_code).first():
        invite_code = secrets.token_hex(8).upper()

    new_family = Family(name=family_in.name.strip(), invite_code=invite_code)
    db.add(new_family)
    db.flush()

    background_tasks.add_task(
        log_event,
        action="ADMIN_CREATE_FAMILY",
        user_id=admin.id,
        details={
            "family_id": new_family.id,
            "family_name": new_family.name,
            "invite_code": invite_code
        },
        ip_address=get_client_ip(request)
    )

    db.commit()
    db.refresh(new_family)

    logger.info("Family created by Admin: family_id=%s, name='%s', by admin_id=%s", new_family.id, new_family.name, admin.id)
    return FamilyCreateResponseAdmin(
        id=new_family.id,
        name=new_family.name,
        invite_code=new_family.invite_code,
        created_at=new_family.created_at
    )

@router.get("/families/{family_id}", response_model=FamilyDetailResponse, dependencies=[Depends(admin_action_limiter)])
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

@router.get("/users", response_model=List[UserResponse], dependencies=[Depends(admin_action_limiter)])
def get_admin_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin),
    skip: int = Query(0, ge=0),
    limit: int = Query(MAX_PAGINATION_LIMIT, ge=1, le=MAX_PAGINATION_LIMIT)
):
    # UserResponse スキーマが is_superadmin を持っているのでそれを利用
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.patch("/users/{user_id}/superadmin", response_model=UserResponse, dependencies=[Depends(admin_action_limiter)])
def toggle_superadmin(
    user_id: int,
    request_data: SuperAdminToggleRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 自分自身の権限は剥奪できないようにする（安全のため）
    if user.id == admin.id and not request_data.is_superadmin:
        raise HTTPException(status_code=400, detail="Cannot demote yourself from SuperAdmin")

    user.is_superadmin = request_data.is_superadmin
    
    background_tasks.add_task(
        log_event,
        action="SUPERADMIN_STATUS_CHANGE",
        user_id=admin.id,
        details={
            "target_user_id": user.id,
            "target_username": user.username,
            "new_status": request_data.is_superadmin
        },
        ip_address=get_client_ip(request)
    )
    
    db.commit()
    db.refresh(user)
    
    logger.info("SuperAdmin status updated: target_user_id=%s, new_status=%s, by admin_id=%s", user.id, request_data.is_superadmin, admin.id)
    return user

@router.get("/audit-logs", response_model=List[AuditLogResponse], dependencies=[Depends(admin_action_limiter)])
def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    logs = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    result = []
    for log in logs:
        result.append(AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            username=log.user.username if log.user else None,
            action=log.action,
            details=log.details,
            ip_address=log.ip_address,
            created_at=log.created_at
        ))
    return result

@router.post("/audit-logs/cleanup", dependencies=[Depends(admin_action_limiter)])
def trigger_audit_log_cleanup(
    background_tasks: BackgroundTasks,
    days: int = Query(90, ge=1, le=3650),
    request: Request = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Manually trigger deletion of old audit logs.
    """
    from app.utils.audit import cleanup_old_audit_logs
    
    deleted_count = cleanup_old_audit_logs(db, days=days)
    db.commit()
    
    background_tasks.add_task(
        log_event,
        action="ADMIN_CLEANUP_AUDIT_LOGS",
        user_id=admin.id,
        details={
            "days_threshold": days,
            "deleted_count": deleted_count
        },
        ip_address=get_client_ip(request) if request else None
    )
    
    return {
        "status": "success",
        "message": f"Successfully deleted {deleted_count} audit logs older than {days} days.",
        "deleted_count": deleted_count
    }

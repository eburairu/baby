import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.utils.rate_limit import RateLimiter
from app.core import constants
from app.models.user import User, UserSession
from app.models.family import Family, FamilyUser
from app.models.enums import UserRole
from app.schemas.family import (
    FamilyResponse,
    FamilyUpdate,
    FamilyMemberResponse,
    MemberRoleUpdate,
    PasswordResetResponse,
)
from app.services.auth import get_password_hash

router = APIRouter(prefix="/api/family", tags=["family"])
logger = logging.getLogger(__name__)

# Limit password reset attempts to 3 per 60 seconds to prevent abuse/DoS
reset_password_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_RESET_PASSWORD_REQUESTS,
    time_window=constants.RATE_LIMIT_RESET_PASSWORD_WINDOW,
    error_message="Too many password reset attempts. Please try again later.",
)

# Limit invite code regeneration to prevent abuse/DoS
regenerate_invite_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_REGENERATE_INVITE_REQUESTS,
    time_window=constants.RATE_LIMIT_REGENERATE_INVITE_WINDOW,
    error_message="Too many invite code generation requests. Please try again later.",
)

def _get_family_user(db: Session, current_user: User) -> FamilyUser:
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=404, detail="Family not found")
    return family_user


def _require_admin(family_user: FamilyUser, current_user: User) -> None:
    if family_user.role != UserRole.ADMIN and not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Admin role required")


@router.get("/", response_model=FamilyResponse)
def get_family(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = _get_family_user(db, current_user)
    family = db.query(Family).filter(Family.id == family_user.family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family


@router.patch("/", response_model=FamilyResponse)
def update_family(
    body: FamilyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user, current_user)
    if not body.name.strip():
        raise HTTPException(status_code=422, detail="Family name cannot be empty")
    family = db.query(Family).filter(Family.id == family_user.family_id).first()
    family.name = body.name.strip()
    logger.info("Family updated: family_id=%s, name='%s', by user_id=%s", family.id, family.name, current_user.id)
    db.commit()
    db.refresh(family)
    return family


@router.post("/invite_code/regenerate", response_model=FamilyResponse, dependencies=[Depends(regenerate_invite_limiter)])
def regenerate_invite_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user, current_user)
    family = db.query(Family).filter(Family.id == family_user.family_id).first()
    new_code = secrets.token_hex(8).upper()
    while db.query(Family).filter(Family.invite_code == new_code).first():
        new_code = secrets.token_hex(8).upper()
    family.invite_code = new_code
    family.invite_code_expires_at = datetime.now(timezone.utc) + timedelta(hours=48)
    logger.info("Invite code regenerated: family_id=%s, by user_id=%s", family.id, current_user.id)
    db.commit()
    db.refresh(family)
    return family


@router.get("/members", response_model=List[FamilyMemberResponse])
def get_family_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    members = (
        db.query(FamilyUser)
        .options(joinedload(FamilyUser.user))
        .filter(FamilyUser.family_id == family_user.family_id)
        .all()
    )
    result = []
    for m in members:
        result.append(
            FamilyMemberResponse(
                user_id=m.user_id,
                username=m.user.username,
                display_name=m.user.display_name,
                role=m.role,
                joined_at=m.joined_at,
            )
        )
    return result


@router.patch("/members/{user_id}/role", response_model=FamilyMemberResponse)
def update_member_role(
    user_id: int,
    body: MemberRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user, current_user)
    target = (
        db.query(FamilyUser)
        .filter(
            FamilyUser.family_id == family_user.family_id,
            FamilyUser.user_id == user_id,
        )
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    # 最後の admin を降格しないようガード
    if target.role == UserRole.ADMIN and body.role != UserRole.ADMIN:
        admin_count = (
            db.query(FamilyUser)
            .filter(FamilyUser.family_id == family_user.family_id, FamilyUser.role == UserRole.ADMIN)
            .count()
        )
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="At least one admin is required")
    target.role = body.role
    logger.info("Member role updated: target_user_id=%s, new_role=%s, by user_id=%s", user_id, body.role, current_user.id)
    db.commit()
    db.refresh(target)
    return FamilyMemberResponse(
        user_id=target.user_id,
        username=target.user.username,
        role=target.role,
        joined_at=target.joined_at,
    )


@router.post("/members/{user_id}/reset-password", response_model=PasswordResetResponse, dependencies=[Depends(reset_password_limiter)])
def reset_member_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PasswordResetResponse:
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user, current_user)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot reset your own password here")
    target_family_user = (
        db.query(FamilyUser)
        .filter(
            FamilyUser.family_id == family_user.family_id,
            FamilyUser.user_id == user_id,
        )
        .first()
    )
    if not target_family_user:
        raise HTTPException(status_code=404, detail="Member not found")
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    temporary_password = secrets.token_urlsafe(9)  # ~12 chars
    target_user.hashed_password = get_password_hash(temporary_password)
    logger.info("Member password reset: target_user_id=%s, by user_id=%s", user_id, current_user.id)
    db.query(UserSession).filter(UserSession.user_id == user_id).delete()
    db.commit()
    return PasswordResetResponse(temporary_password=temporary_password)


@router.delete("/members/{user_id}", status_code=204)
def delete_member(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user, current_user)
    target = (
        db.query(FamilyUser)
        .filter(
            FamilyUser.family_id == family_user.family_id,
            FamilyUser.user_id == user_id,
        )
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    # 最後の admin を削除しないようガード
    if target.role == UserRole.ADMIN:
        admin_count = (
            db.query(FamilyUser)
            .filter(FamilyUser.family_id == family_user.family_id, FamilyUser.role == UserRole.ADMIN)
            .count()
        )
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="At least one admin is required")
    db.delete(target)
    logger.info("Member deleted: target_user_id=%s, from family_id=%s, by user_id=%s", user_id, family_user.family_id, current_user.id)
    db.commit()

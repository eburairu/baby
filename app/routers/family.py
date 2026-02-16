import secrets
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.schemas.family import (
    FamilyResponse,
    FamilyUpdate,
    FamilyMemberResponse,
    MemberRoleUpdate,
)

router = APIRouter(prefix="/api/family", tags=["family"])


def _get_family_user(db: Session, current_user: User) -> FamilyUser:
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=404, detail="Family not found")
    return family_user


def _require_admin(family_user: FamilyUser) -> None:
    if family_user.role != UserRole.ADMIN:
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
    _require_admin(family_user)
    if not body.name.strip():
        raise HTTPException(status_code=422, detail="Family name cannot be empty")
    family = db.query(Family).filter(Family.id == family_user.family_id).first()
    family.name = body.name.strip()
    db.commit()
    db.refresh(family)
    return family


@router.post("/invite_code/regenerate", response_model=FamilyResponse)
def regenerate_invite_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user)
    family = db.query(Family).filter(Family.id == family_user.family_id).first()
    new_code = secrets.token_urlsafe(8)
    family.invite_code = new_code
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
    _require_admin(family_user)
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
    db.commit()
    db.refresh(target)
    return FamilyMemberResponse(
        user_id=target.user_id,
        username=target.user.username,
        role=target.role,
        joined_at=target.joined_at,
    )


@router.delete("/members/{user_id}", status_code=204)
def delete_member(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    family_user = _get_family_user(db, current_user)
    _require_admin(family_user)
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
    db.delete(target)
    db.commit()

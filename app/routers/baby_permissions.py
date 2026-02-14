from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.family import FamilyUser
from app.models.baby import Baby, BabyPermission
from app.schemas.baby_permission import (
    BabyPermissionsResponse,
    BabyPermissionUpdate,
    UserPermissionSet,
    BabyPermissionItem,
    VALID_RECORD_TYPES
)

router = APIRouter(prefix="/api/babies", tags=["baby_permissions"])


@router.get("/{baby_id}/permissions", response_model=BabyPermissionsResponse)
def get_baby_permissions(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. verify_baby_access() でアクセス検証（admin ロール確認を追加）
    verify_baby_access(db, baby_id, current_user.id)
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if family_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage permissions")

    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    
    # 2. 同一ファミリーの member ロールユーザー全員を FamilyUser から取得（自身 = admin は除外）
    members = db.query(FamilyUser, User).join(User, FamilyUser.user_id == User.id).filter(
        FamilyUser.family_id == family_user.family_id,
        FamilyUser.role == "member"
    ).all()

    record_types = ["baby", "feeding", "sleep", "diaper", "growth", "contraction", "schedule"]
    
    response_members = []
    for fu, u in members:
        # 3. 各ユーザーについて BabyPermission を検索
        perms = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == u.id
        ).all()
        perm_dict = {p.record_type: p.can_view for p in perms}
        
        user_perms = []
        for rt in record_types:
            user_perms.append(BabyPermissionItem(
                record_type=rt,
                can_view=perm_dict.get(rt, True)  # デフォルト許可
            ))
            
        response_members.append(UserPermissionSet(
            user_id=u.id,
            username=u.username,
            permissions=user_perms
        ))

    return BabyPermissionsResponse(
        baby_id=baby.id,
        baby_name=baby.name,
        members=response_members
    )


@router.put("/{baby_id}/permissions", response_model=BabyPermissionsResponse)
def update_baby_permissions(
    baby_id: int,
    update_in: BabyPermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. verify_baby_access() でアクセス検証（admin ロール確認を追加）
    verify_baby_access(db, baby_id, current_user.id)
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if family_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage permissions")

    # 2. リクエストの各エントリについて検証
    valid_types = ["baby", "feeding", "sleep", "diaper", "growth", "contraction", "schedule"]
    for entry in update_in.permissions:
        if entry.record_type not in valid_types:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid record_type: {entry.record_type}")
        
        # 3. user_id が同一ファミリーの member ロールであることを確認
        target_member = db.query(FamilyUser).filter(
            FamilyUser.user_id == entry.user_id,
            FamilyUser.family_id == family_user.family_id,
            FamilyUser.role == "member"
        ).first()
        if not target_member:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User {entry.user_id} is not a member of your family")

        # 4. 各エントリを upsert で処理
        existing = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == entry.user_id,
            BabyPermission.record_type == entry.record_type
        ).first()
        if existing:
            existing.can_view = entry.can_view
        else:
            db.add(BabyPermission(
                baby_id=baby_id,
                user_id=entry.user_id,
                record_type=entry.record_type,
                can_view=entry.can_view
            ))
            
    db.commit()
    
    # 5. 更新後の権限一覧を返す（GET と同じ形式）
    return get_baby_permissions(baby_id, db, current_user)

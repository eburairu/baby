from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal
from app.models.baby import Baby, BabyPermission
from app.models.family import FamilyUser
from app.models.enums import UserRole
from app.models.user import User, UserSession
from app.utils.timezone import ensure_aware
from app.utils.session import hash_token
from app.utils.audit import get_client_ip
from app.config import SESSION_EXPIRE_DAYS, COOKIE_SECURE


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


def get_current_user(request: Request, response: Response, db: db_dependency):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    session = db.query(UserSession).filter(
        UserSession.token == hash_token(token),
        UserSession.expires_at > func.now()
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    current_ip = get_client_ip(request)
    current_ua = request.headers.get("user-agent")

    if session.ip_address and current_ip and session.ip_address != current_ip:
        db.delete(session)
        db.commit()
        response.delete_cookie("access_token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session invalidated due to IP change")

    if session.user_agent and current_ua and session.user_agent != current_ua:
        db.delete(session)
        db.commit()
        response.delete_cookie("access_token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session invalidated due to User-Agent change")

    # Sliding session: extend expiration if remaining time is less than threshold
    # (e.g., if SESSION_EXPIRE_DAYS is 7, update only if less than 6 days remaining)
    expires_at = ensure_aware(session.expires_at)
    
    threshold = datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRE_DAYS - 1)
    if expires_at < threshold:
        session.expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRE_DAYS)
        db.commit()

        # Extend cookie in browser
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=COOKIE_SECURE,
            path="/",
            max_age=SESSION_EXPIRE_DAYS * 24 * 3600
        )

    user = db.query(User).filter(User.id == session.user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_superadmin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SuperAdmin privileges required"
        )
    return current_user


user_dependency = Annotated[User, Depends(get_current_user)]
superadmin_dependency = Annotated[User, Depends(get_current_superadmin)]


def verify_baby_access(
    db: Session,
    baby_id: int,
    user_id: int,
    record_type: str = "baby",
    require_write: bool = False
) -> Baby:
    """
    baby_id がユーザーのファミリーに属するか検証し、
    BabyPermission による閲覧制限もチェックする。
    require_write=True の場合、viewer ロールを拒否する。
    失敗時 403 を raise。
    """
    user = db.query(User).filter(User.id == user_id).first()
    is_superadmin = user and user.is_superadmin

    # 先に赤ちゃんを取得して family_id を特定する
    baby = db.query(Baby).filter(Baby.id == baby_id, Baby.is_deleted == False).first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")

    # 赤ちゃんのファミリーに所属しているかを確認
    family_user = db.query(FamilyUser).filter(
        FamilyUser.user_id == user_id,
        FamilyUser.family_id == baby.family_id
    ).first()
    
    if not family_user and not is_superadmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in this baby's family")

    # 書き込み制限のチェック
    if require_write:
        can_write = (family_user and family_user.role != UserRole.VIEWER) or is_superadmin
        if not can_write:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Read-only users cannot perform this action"
            )

    # admin / superadmin は常に許可
    if is_superadmin or (family_user and family_user.role == UserRole.ADMIN):
        return baby

    # 書き込み操作の場合、BabyPermission の can_view チェックをスキップ
    # BabyPermission は閲覧アクセス制御のみ担当（書き込み権限はロールで制御）
    # MEMBER は BabyPermission 未設定でも記録を作成・編集・削除できる
    if require_write:
        return baby

    # "baby" レベルの可視性チェック（デフォルト拒否）
    baby_perm = db.query(BabyPermission).filter(
        BabyPermission.baby_id == baby_id,
        BabyPermission.user_id == user_id,
        BabyPermission.record_type == "baby",
    ).first()
    if not baby_perm or not baby_perm.can_view:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")

    # 記録タイプ別の可視性チェック（"baby" 以外の record_type が指定された場合、デフォルト拒否）
    if record_type != "baby":
        type_perm = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == user_id,
            BabyPermission.record_type == record_type,
        ).first()
        if not type_perm or not type_perm.can_view:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied to {record_type} records for this baby"
            )

    return baby


def verify_write_access(db: Session, user_id: int) -> FamilyUser:
    """
    ユーザーが書き込み権限（admin または member）を持っているか検証する。
    viewer の場合は 403 を raise。
    """
    user = db.query(User).filter(User.id == user_id).first()
    is_superadmin = user and user.is_superadmin

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user and not is_superadmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")

    can_write = (family_user and family_user.role != UserRole.VIEWER) or is_superadmin
    if not can_write:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Read-only users cannot perform this action"
        )
    return family_user

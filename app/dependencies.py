from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.baby import Baby, BabyPermission
from app.models.family import FamilyUser, UserRole
from app.config import SESSION_EXPIRE_DAYS, COOKIE_SECURE


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


def get_current_user(request: Request, response: Response, db: db_dependency):
    from app.models.user import User, UserSession

    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.expires_at > datetime.now()
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    # Sliding session: extend expiration
    session.expires_at = datetime.now() + timedelta(days=SESSION_EXPIRE_DAYS)
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


user_dependency = Annotated[object, Depends(get_current_user)]


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
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")

    # 書き込み制限のチェック
    if require_write and family_user.role == UserRole.VIEWER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Read-only users cannot perform this action"
        )

    baby = db.query(Baby).filter(
        Baby.id == baby_id,
        Baby.family_id == family_user.family_id,
    ).first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")

    # admin は常に許可
    if family_user.role == "admin":
        return baby

    # "baby" レベルの可視性チェック（record_type != "baby" のときも先にチェック）
    baby_perm = db.query(BabyPermission).filter(
        BabyPermission.baby_id == baby_id,
        BabyPermission.user_id == user_id,
        BabyPermission.record_type == "baby",
    ).first()
    if baby_perm and not baby_perm.can_view:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")

    # 記録タイプ別の可視性チェック（"baby" 以外の record_type が指定された場合）
    if record_type != "baby":
        type_perm = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == user_id,
            BabyPermission.record_type == record_type,
        ).first()
        if type_perm and not type_perm.can_view:
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
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")

    if family_user.role == UserRole.VIEWER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Read-only users cannot perform this action"
        )
    return family_user

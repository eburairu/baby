from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import SessionLocal
from app.models.baby import Baby, BabyPermission
from app.models.family import FamilyUser


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


def get_current_user(request: Request, db: db_dependency):
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
    from datetime import timedelta
    # Assuming SESSION_EXPIRE_DAYS is defined somewhere common or I can import it, 
    # but strictly following the file content I might need to redefine or import it.
    # Let's import it from auth router if possible, or just use 7 as per spec.
    # To avoid circular import, I'll use a constant or hardcode 7 for now as it's defined in auth.py
    # Better yet, I will define it here or use a config.
    # For now, I will use 7 days as per spec.
    session.expires_at = datetime.now() + timedelta(days=7)
    db.commit()

    user = db.query(User).filter(User.id == session.user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


user_dependency = Annotated[object, Depends(get_current_user)]


def verify_baby_access(
    db: Session,
    baby_id: int,
    user_id: int,
    record_type: str = "baby"
) -> Baby:
    """
    baby_id がユーザーのファミリーに属するか検証し、
    BabyPermission による閲覧制限もチェックする。
    失敗時 403 を raise。
    """
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")

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

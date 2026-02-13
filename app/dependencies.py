from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import SessionLocal
from app.models.baby import Baby
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

    user = db.query(User).filter(User.id == session.user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


user_dependency = Annotated[object, Depends(get_current_user)]


def verify_baby_access(db: Session, baby_id: int, user_id: int) -> Baby:
    """baby_id がユーザーのファミリーに属するか検証。失敗時 403 を raise。"""
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
    baby = db.query(Baby).filter(
        Baby.id == baby_id,
        Baby.family_id == family_user.family_id,
    ).first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")
    return baby

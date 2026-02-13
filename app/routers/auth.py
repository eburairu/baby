import os
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_db, get_current_user
from app.schemas.auth import LoginRequest
from app.schemas.family import FamilyCreate, FamilyResponse
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User, UserSession
from app.models.family import Family, FamilyUser
from app.services.auth import verify_password, get_password_hash

router = APIRouter(prefix="/api/auth", tags=["auth"])

SESSION_EXPIRE_DAYS = 7
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"


def _create_session(db: Session, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    session = UserSession(
        token=token,
        user_id=user_id,
        expires_at=datetime.utcnow() + timedelta(days=SESSION_EXPIRE_DAYS),
    )
    db.add(session)
    db.commit()
    return token


@router.post("/register/family", response_model=FamilyResponse)
def register_family(family_in: FamilyCreate, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == family_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    invite_code = secrets.token_hex(4).upper()
    while db.query(Family).filter(Family.invite_code == invite_code).first():
        invite_code = secrets.token_hex(4).upper()

    new_family = Family(name=family_in.name, invite_code=invite_code)
    db.add(new_family)
    db.flush()

    new_user = User(
        username=family_in.username,
        hashed_password=get_password_hash(family_in.password),
    )
    db.add(new_user)
    db.flush()

    family_user = FamilyUser(family_id=new_family.id, user_id=new_user.id, role="admin")
    db.add(family_user)
    db.commit()
    db.refresh(new_family)

    token = _create_session(db, new_user.id)
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", secure=COOKIE_SECURE)
    return new_family


@router.post("/register/join", response_model=UserResponse)
def join_family(user_in: UserCreate, invite_code: str, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    family = db.query(Family).filter(Family.invite_code == invite_code).first()
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    new_user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(new_user)
    db.flush()

    family_user = FamilyUser(family_id=family.id, user_id=new_user.id, role="member")
    db.add(family_user)
    db.commit()
    db.refresh(new_user)

    token = _create_session(db, new_user.id)
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", secure=COOKIE_SECURE)
    return new_user


@router.post("/login", response_model=UserResponse)
def login(login_request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_request.username).first()
    if not user or not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    token = _create_session(db, user.id)
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", secure=COOKIE_SECURE)
    return user


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if token:
        db.query(UserSession).filter(UserSession.token == token).delete()
        db.commit()
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

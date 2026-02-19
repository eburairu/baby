
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_db, get_current_user
from app.schemas.auth import LoginRequest
from app.schemas.family import FamilyCreate, FamilyResponse
from app.schemas.user import UserCreate, UserResponse, UserProfileUpdate, PasswordChangeRequest
from app.models.user import User, UserSession
from app.models.family import Family, FamilyUser, UserRole
from app.services.auth import verify_password, get_password_hash
from app.config import SESSION_EXPIRE_DAYS, COOKIE_SECURE

router = APIRouter(prefix="/api/auth", tags=["auth"])



def _create_session(db: Session, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    session = UserSession(
        token=token,
        user_id=user_id,
        expires_at=datetime.now() + timedelta(days=SESSION_EXPIRE_DAYS),
    )
    db.add(session)
    db.commit()
    return token


@router.post("/change-password", status_code=204)
def change_password(
    req: PasswordChangeRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(req.new_password)
    current_token = request.cookies.get("access_token")
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.token != current_token,
    ).delete()
    db.commit()


@router.patch("/me", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Empty string is treated as null
    new_display_name = profile_in.display_name
    if new_display_name is not None and new_display_name.strip() == "":
        new_display_name = None

    current_user.display_name = new_display_name
    db.commit()
    db.refresh(current_user)
    return current_user



@router.post("/register/family", response_model=FamilyResponse)
def register_family(family_in: FamilyCreate, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == family_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    invite_code = secrets.token_hex(8).upper()
    while db.query(Family).filter(Family.invite_code == invite_code).first():
        invite_code = secrets.token_hex(8).upper()

    new_family = Family(name=family_in.name, invite_code=invite_code)
    db.add(new_family)
    db.flush()

    new_user = User(
        username=family_in.username,
        hashed_password=get_password_hash(family_in.password),
    )
    db.add(new_user)
    db.flush()

    family_user = FamilyUser(family_id=new_family.id, user_id=new_user.id, role=UserRole.ADMIN)
    db.add(family_user)
    db.commit()
    db.refresh(new_family)

    token = _create_session(db, new_user.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
        max_age=SESSION_EXPIRE_DAYS * 24 * 3600
    )
    return new_family


@router.post("/register/join", response_model=UserResponse)
def join_family(user_in: UserCreate, invite_code: str, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Normalize invite code to uppercase to handle case-insensitive input
    invite_code = invite_code.upper()
    family = db.query(Family).filter(Family.invite_code == invite_code).first()
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    new_user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(new_user)
    db.flush()

    family_user = FamilyUser(family_id=family.id, user_id=new_user.id, role=UserRole.VIEWER)
    db.add(family_user)
    db.commit()
    db.refresh(new_user)

    token = _create_session(db, new_user.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
        max_age=SESSION_EXPIRE_DAYS * 24 * 3600
    )
    
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        display_name=new_user.display_name,
        role=UserRole.VIEWER,
        created_at=new_user.created_at
    )


@router.post("/login", response_model=UserResponse)
def login(login_request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_request.username).first()
    if not user or not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user.id).first()
    role = family_user.role if family_user else None

    token = _create_session(db, user.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
        max_age=SESSION_EXPIRE_DAYS * 24 * 3600
    )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        role=role,
        created_at=user.created_at
    )


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if token:
        db.query(UserSession).filter(UserSession.token == token).delete()
        db.commit()
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def read_users_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    role = family_user.role if family_user else None
    
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        display_name=current_user.display_name,
        role=role,
        created_at=current_user.created_at
    )

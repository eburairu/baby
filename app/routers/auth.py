import secrets
from datetime import datetime, timedelta, timezone
from app.utils.session import hash_token

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_db, get_current_user
from app.schemas.auth import LoginRequest
from app.schemas.family import FamilyCreate, FamilyResponse
from app.schemas.user import UserCreate, UserResponse, UserProfileUpdate, PasswordChangeRequest
from app.models.user import User, UserSession
from app.models.family import Family, FamilyUser
from app.models.enums import UserRole
from app.services.auth import verify_password, get_password_hash, verify_password_async, get_password_hash_async
from app.config import SESSION_EXPIRE_DAYS, COOKIE_SECURE
from app.utils.rate_limit import RateLimiter
from app.utils.audit import log_event, get_client_ip
from app.core import constants

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Limit login attempts to 5 per 60 seconds
login_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_LOGIN_REQUESTS,
    time_window=constants.RATE_LIMIT_LOGIN_WINDOW,
    error_message="Too many login attempts. Please try again later.",
)

# Limit password change attempts to 3 per 60 seconds
change_password_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_CHANGE_PASSWORD_REQUESTS,
    time_window=constants.RATE_LIMIT_CHANGE_PASSWORD_WINDOW,
    error_message="Too many password change attempts. Please try again later.",
)

# Limit registration attempts to 3 per 60 seconds to prevent spam
register_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_REGISTER_REQUESTS,
    time_window=constants.RATE_LIMIT_REGISTER_WINDOW,
    error_message="Too many registration attempts. Please try again later.",
)

# Generate a dummy hash for timing attack mitigation
# This ensures verify_password is called even if user is not found,
# making response times consistent regardless of user existence.
DUMMY_HASH = get_password_hash("dummy_password_for_timing_mitigation")

def _create_session(db: Session, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    session = UserSession(
        token=hash_token(token),
        user_id=user_id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRE_DAYS),
    )
    db.add(session)
    db.flush()  # Use flush instead of commit to join caller's transaction
    return token


@router.post("/change-password", status_code=204, dependencies=[Depends(change_password_limiter)])
async def change_password(
    req: PasswordChangeRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not await verify_password_async(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = await get_password_hash_async(req.new_password)
    current_token = request.cookies.get("access_token")
    current_token_hash = hash_token(current_token) if current_token else None
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.token != current_token_hash,
    ).delete()
    
    background_tasks.add_task(
        log_event,
        action="PASSWORD_CHANGE", 
        user_id=current_user.id, 
        ip_address=get_client_ip(request)
    )
    
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



@router.post(
    "/register/family",
    response_model=FamilyResponse,
    dependencies=[Depends(register_limiter)],
)
async def register_family(
    family_in: FamilyCreate,
    response: Response,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(func.lower(User.username) == family_in.username.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    invite_code = secrets.token_hex(8).upper()
    while db.query(Family).filter(Family.invite_code == invite_code).first():
        invite_code = secrets.token_hex(8).upper()

    invite_code_expires_at = datetime.now(timezone.utc) + timedelta(hours=48)
    new_family = Family(name=family_in.name, invite_code=invite_code, invite_code_expires_at=invite_code_expires_at)
    db.add(new_family)
    db.flush()

    new_user = User(
        username=family_in.username.lower(),
        hashed_password=await get_password_hash_async(family_in.password),
    )
    db.add(new_user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username already registered")

    family_user = FamilyUser(family_id=new_family.id, user_id=new_user.id, role=UserRole.ADMIN)
    db.add(family_user)
    db.flush() # Ensure ids are assigned but not committed yet

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
    
    background_tasks.add_task(
        log_event,
        action="REGISTER_FAMILY",
        user_id=new_user.id,
        details={"family_id": new_family.id, "family_name": new_family.name},
        ip_address=get_client_ip(request)
    )
    
    db.commit() # FINAL ATOMIC COMMIT
    db.refresh(new_family)
    return new_family


@router.post(
    "/register/join",
    response_model=UserResponse,
    dependencies=[Depends(register_limiter)],
)
async def join_family(
    user_in: UserCreate, 
    invite_code: str, 
    response: Response, 
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(func.lower(User.username) == user_in.username.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Normalize invite code to uppercase to handle case-insensitive input
    invite_code = invite_code.upper()
    family = db.query(Family).filter(Family.invite_code == invite_code).first()
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    if family.invite_code_expires_at and family.invite_code_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Invite code has expired")

    new_user = User(
        username=user_in.username.lower(),
        hashed_password=await get_password_hash_async(user_in.password),
    )
    db.add(new_user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username already registered")

    family_user = FamilyUser(family_id=family.id, user_id=new_user.id, role=UserRole.VIEWER)
    db.add(family_user)
    db.flush()

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

    background_tasks.add_task(
        log_event,
        action="JOIN_FAMILY",
        user_id=new_user.id,
        details={"family_id": family.id, "family_name": family.name},
        ip_address=get_client_ip(request)
    )
    
    db.commit() # FINAL ATOMIC COMMIT
    db.refresh(new_user)
    
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        display_name=new_user.display_name,
        role=UserRole.VIEWER,
        is_superadmin=new_user.is_superadmin,
        created_at=new_user.created_at
    )


@router.post("/login", response_model=UserResponse, dependencies=[Depends(login_limiter)])
async def login(
    login_request: LoginRequest,
    response: Response,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(func.lower(User.username) == login_request.username.lower()).first()

    # Timing Attack Mitigation:
    # Verify password against dummy hash if user not found to equalize response time
    if not user:
        await verify_password_async(login_request.password, DUMMY_HASH)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    if not await verify_password_async(login_request.password, user.hashed_password):
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
    
    background_tasks.add_task(
        log_event,
        action="LOGIN",
        user_id=user.id,
        ip_address=get_client_ip(request)
    )
    
    db.commit() # FINAL ATOMIC COMMIT
    
    return UserResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        role=role,
        is_superadmin=user.is_superadmin,
        created_at=user.created_at
    )


@router.post("/logout")
def logout(request: Request, response: Response, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if token:
        session = db.query(UserSession).filter(UserSession.token == hash_token(token)).first()
        if session:
            # Note: log_event in background task decoupled from main transaction
            background_tasks.add_task(
                log_event,
                action="LOGOUT", 
                user_id=session.user_id, 
                ip_address=get_client_ip(request)
            )
            db.delete(session)
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
        is_superadmin=current_user.is_superadmin,
        created_at=current_user.created_at
    )

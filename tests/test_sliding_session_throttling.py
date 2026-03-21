import pytest
from datetime import datetime, timedelta, timezone
from app.models.user import User, UserSession
from app.services.auth import get_password_hash
from app.utils.session import hash_token
from app.config import SESSION_EXPIRE_DAYS
from app.utils.timezone import ensure_aware

@pytest.fixture
def test_user(db):
    username = "throttling_user"
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user
    password = "testpassword"
    hashed_password = get_password_hash(password)
    user = User(username=username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_sliding_session_throttling(client, test_user, db):
    # 1. Login
    response = client.post("/api/auth/login", json={"username": test_user.username, "password": "testpassword"})
    assert response.status_code == 200
    token = response.cookies["access_token"]
    
    # Get session from DB (token is stored as SHA-256 hash)
    session = db.query(UserSession).filter(UserSession.token == hash_token(token)).first()
    assert session is not None
    initial_expiry = session.expires_at
    
    # 2. Access protected route immediately (should NOT extend session DB/Cookie in new implementation)
    # But in CURRENT implementation, it WILL extend.
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    
    db.refresh(session)
    after_access_expiry = session.expires_at
    
    # Check if it was updated (Current behavior: True, Expected behavior after fix: False)
    # For TDD Red phase, we expect it to be updated because we haven't implemented throttling yet.
    # However, to make it a proper "Red" test for the FEATURE, we should assert it's NOT updated.
    assert after_access_expiry == initial_expiry, "Session should not be updated on every request"

def test_sliding_session_update_after_threshold(client, test_user, db):
    # 1. Login
    response = client.post("/api/auth/login", json={"username": test_user.username, "password": "testpassword"})
    assert response.status_code == 200
    token = response.cookies["access_token"]
    
    # Get session from DB (token is stored as SHA-256 hash)
    session = db.query(UserSession).filter(UserSession.token == hash_token(token)).first()

    # 2. Manually backdate the expires_at in DB to simulate "time passed"
    # Set it to now + 12 hours (threshold is 1 day remaining)
    session.expires_at = datetime.now(timezone.utc) + timedelta(hours=12)
    db.commit()
    db.refresh(session)
    backdated_expiry = session.expires_at

    # 3. Access protected route (should extend session now because it's below threshold)
    response = client.get("/api/auth/me")
    assert response.status_code == 200

    db.refresh(session)
    updated_expiry = session.expires_at

    assert updated_expiry > backdated_expiry
    # Should be about now + 7 days
    assert abs((ensure_aware(updated_expiry) - (datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRE_DAYS))).total_seconds()) < 60

import pytest
from datetime import datetime, timedelta, timezone
from app.models.user import User, UserSession
from app.services.auth import get_password_hash
from app.utils.timezone import ensure_aware

# Note: client and db fixtures are provided by conftest.py

@pytest.fixture
def test_user(db):
    # Create a test user
    password = "testpassword"
    hashed_password = get_password_hash(password)
    user = User(username="test_auth_user", hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_login_cookie_attributes(client, test_user):
    response = client.post("/api/auth/login", json={"username": test_user.username, "password": "testpassword"})
    assert response.status_code == 200
    
    # Check cookie attributes
    assert "access_token" in response.cookies
    
    # Verify strict attributes in Set-Cookie header
    set_cookie = response.headers["set-cookie"]
    # Normalize to lowercase for easier checking
    set_cookie_lower = set_cookie.lower()
    
    assert "httponly" in set_cookie_lower
    assert "path=/" in set_cookie_lower
    assert "samesite=lax" in set_cookie_lower
    # Secure is disabled in conftest.py via environment variable
    
def test_sliding_session(client, test_user, db):
    # 1. Login
    response = client.post("/api/auth/login", json={"username": test_user.username, "password": "testpassword"})
    assert response.status_code == 200
    token = response.cookies["access_token"]
    
    # Get session from DB
    session = db.query(UserSession).filter(UserSession.token == token).first()
    assert session is not None
    initial_expiry = ensure_aware(session.expires_at)
    
    # Ensure expiry is roughly 7 days from now
    now = datetime.now(timezone.utc)
    expected_expiry = now + timedelta(days=7)
    # Allow 1 minute difference
    assert abs((initial_expiry - expected_expiry).total_seconds()) < 60
    
    # 2. Access protected route (should NOT extend session immediately due to throttling)
    import time
    time.sleep(1.1) 
    
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    
    db.refresh(session)
    updated_expiry = ensure_aware(session.expires_at)
    
    # In current implementation with throttling, it should NOT be updated
    assert updated_expiry == initial_expiry

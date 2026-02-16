import pytest
from sqlalchemy.orm import Session
from app.models.user import User, UserSession
from app.services.auth import get_password_hash
from datetime import datetime, timedelta

def test_login_persistence(client, db: Session):
    # Setup: Register a family (this also logs in and sets the cookie)
    response = client.post(
        "/api/auth/register/family",
        json={
            "name": "Persist Family",
            "username": "persist_user",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    
    # Check Set-Cookie header for Max-Age and other attributes
    set_cookie = response.headers.get("set-cookie")
    assert "access_token=" in set_cookie
    assert "Max-Age=604800" in set_cookie
    assert "HttpOnly" in set_cookie
    assert "SameSite=lax" in set_cookie

def test_sliding_session_cookie_refresh(client, db: Session):
    # Setup: Register a family to get a valid user and family structure
    response = client.post(
        "/api/auth/register/family",
        json={
            "name": "Sliding Family",
            "username": "sliding_user",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    user = db.query(User).filter(User.username == "sliding_user").first()
    
    # Replace the session with one that is about to expire
    token = client.cookies.get("access_token")
    session = db.query(UserSession).filter(UserSession.token == token).first()
    session.expires_at = datetime.now() + timedelta(days=1)
    db.commit()

    # Access /api/auth/me to trigger sliding session
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    
    # Verify sliding session extended DB expiration
    db.refresh(session)
    assert session.expires_at > datetime.now() + timedelta(days=6)

    # Verify response contains refreshed cookie with full Max-Age
    set_cookie = response.headers.get("set-cookie")
    assert f"access_token={token}" in set_cookie
    assert "Max-Age=604800" in set_cookie
    assert "SameSite=lax" in set_cookie

def test_expired_session_fails(client, db: Session):
    # Setup: Register a family
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Expired Family",
            "username": "expired_user",
            "password": "testpassword123"
        }
    )
    token = client.cookies.get("access_token")
    session = db.query(UserSession).filter(UserSession.token == token).first()
    
    # Make session expired
    session.expires_at = datetime.now() - timedelta(seconds=1)
    db.commit()

    # Access /api/auth/me with the expired token
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Invalid or expired session" in response.json()["detail"]

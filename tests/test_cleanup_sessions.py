from datetime import datetime, timedelta
import pytest
from app.models.user import User, UserSession
from app.services.auth import get_password_hash

# Import the script's function
# Since scripts isn't a package natively, we need to import it properly or we can just import from it if the path is set up.
# Wait, it's better to create a function in app/services/user_session.py or app/services/auth.py and let the script just call it. But the issue explicitly suggests "スクリプト (`scripts/cleanup_sessions.py`) または内部専用APIエンドポイント". 
# The script can define a function. To import from scripts in a test, Python might have trouble.
# Let's write the logic in `scripts/cleanup_sessions.py` anyway.
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.cleanup_sessions import cleanup_expired_sessions

def test_cleanup_expired_sessions(db):
    # Create a user
    hashed_password = get_password_hash("password123")
    user = User(username="testuser", hashed_password=hashed_password)
    db.add(user)
    db.commit()

    now = datetime.now()

    # Create one valid session
    valid_session = UserSession(
        token="valid_token",
        user_id=user.id,
        expires_at=now + timedelta(days=1)
    )
    db.add(valid_session)

    # Create one expired session
    expired_session = UserSession(
        token="expired_token",
        user_id=user.id,
        expires_at=now - timedelta(days=1)
    )
    db.add(expired_session)

    # Create another expired session
    expired_session2 = UserSession(
        token="expired_token2",
        user_id=user.id,
        expires_at=now - timedelta(hours=1)
    )
    db.add(expired_session2)
    
    db.commit()

    # Verify sessions are in DB
    sessions = db.query(UserSession).all()
    assert len(sessions) == 3

    # Run cleanup
    deleted_count = cleanup_expired_sessions(db)
    assert deleted_count == 2

    # Verify only valid session remains
    remaining_sessions = db.query(UserSession).all()
    assert len(remaining_sessions) == 1
    assert remaining_sessions[0].token == "valid_token"

import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.user import User, UserSession
from app.utils.session import hash_token
from app.models.base import SoftDeleteMixin

def test_user_soft_delete_invalidates_sessions(db: Session):
    # 1. ユーザー作成
    user = User(
        username="testuser_1035",
        hashed_password="hashed_password",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. セッション作成
    token = "session_token_1035"
    session = UserSession(
        token=hash_token(token),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(session)
    db.commit()

    # 3. ユーザーを論理削除
    from app.services.user_service import soft_delete_user
    soft_delete_user(db, user)
    db.commit()
    
    # 4. (期待値) セッションが削除されていること
    remaining_session = db.query(UserSession).filter(UserSession.user_id == user.id).first()
    assert remaining_session is None, "Session should be deleted after user soft delete"
    assert user.is_deleted is True

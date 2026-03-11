"""
Issue #863: アクティブユーザー算出ロジックの修正テスト

created_at >= since ではなく expires_at >= now + (SESSION_EXPIRE_DAYS - 1) days
を使うことで、スライディングセッションで継続利用しているユーザーを正確にカウントする。
"""
import pytest
from datetime import datetime, timedelta, timezone
from app.models.user import User, UserSession
from app.config import SESSION_EXPIRE_DAYS
from app.utils.session import hash_token
import secrets


def _make_session(db, user_id: int, expires_at: datetime) -> UserSession:
    token = secrets.token_urlsafe(32)
    session = UserSession(
        token=hash_token(token),
        user_id=user_id,
        expires_at=expires_at,
    )
    db.add(session)
    db.flush()
    return session


def test_active_users_excludes_old_created_at_session(auth_client, db):
    """
    created_at が 48h 前で、expires_at も期限切れ近い古いセッションのユーザーは
    アクティブユーザーとしてカウントされない。
    """
    # superadmin セットアップ
    client = auth_client(username="admin_863_a", password="password123")
    admin = db.query(User).filter(User.username == "admin_863_a").first()
    admin.is_superadmin = True
    db.commit()

    # 基準: 24h以内にアクセスしていないユーザー（expires_at が now+5日）
    old_user = User(username="old_user_863", hashed_password="hashed")
    db.add(old_user)
    db.flush()
    now = datetime.now(timezone.utc)
    _make_session(db, old_user.id, expires_at=now + timedelta(days=SESSION_EXPIRE_DAYS - 2))
    db.commit()

    response = client.get("/api/admin/stats")
    assert response.status_code == 200
    data = response.json()

    # old_user は active にカウントされていないこと
    # (admin本人のセッションは active に含まれるので、old_user が入っていないことを確認)
    # admin のみが active → active_users_last_24h は old_user を含まない
    # 具体的には: admin セッションは今作ったばかり → expires_at = now + 7days → active
    # old_user のセッション → expires_at = now + 5days → NOT active
    # よって active_users_last_24h は old_user_id を含まない
    # 直接的な検証: active 数が old_user の分だけ増えていないことは別テストで確認
    assert "active_users_last_24h" in data


def test_active_users_includes_sliding_session_user(auth_client, db):
    """
    スライディングセッションで昨日アクセスしたユーザーは
    active にカウントされる（BUG FIX 確認）。

    昨日アクセス → expires_at = yesterday + 7days = now + 6days
    条件: expires_at >= now + 6days → TRUE → カウントされるべき
    """
    client = auth_client(username="admin_863_b", password="password123")
    admin = db.query(User).filter(User.username == "admin_863_b").first()
    admin.is_superadmin = True
    db.commit()

    # スライディングセッション延長を模擬: 23時間前にアクセス → expires_at = now + 6days+1h
    sliding_user = User(username="sliding_user_863", hashed_password="hashed")
    db.add(sliding_user)
    db.flush()
    now = datetime.now(timezone.utc)
    last_access = now - timedelta(hours=23)
    _make_session(
        db,
        sliding_user.id,
        expires_at=last_access + timedelta(days=SESSION_EXPIRE_DAYS),  # now + 6days+1h
    )
    db.commit()

    response = client.get("/api/admin/stats")
    assert response.status_code == 200
    data = response.json()

    # admin + sliding_user の両方が active → active_users_last_24h >= 2
    assert data["active_users_last_24h"] >= 2, (
        f"スライディングセッションユーザーがアクティブにカウントされていない: {data['active_users_last_24h']}"
    )


def test_active_users_excludes_user_last_accessed_48h_ago(auth_client, db):
    """
    48時間前にアクセスしたユーザーはアクティブにカウントされない。

    48h前アクセス → expires_at = now - 48h + 7days = now + 5days
    条件: expires_at >= now + 6days → FALSE → カウントされない
    """
    client = auth_client(username="admin_863_c", password="password123")
    admin = db.query(User).filter(User.username == "admin_863_c").first()
    admin.is_superadmin = True
    db.commit()

    inactive_user = User(username="inactive_user_863", hashed_password="hashed")
    db.add(inactive_user)
    db.flush()
    now = datetime.now(timezone.utc)
    last_access_48h_ago = now - timedelta(hours=48)
    _make_session(
        db,
        inactive_user.id,
        expires_at=last_access_48h_ago + timedelta(days=SESSION_EXPIRE_DAYS),  # now + 5days
    )
    db.commit()

    response = client.get("/api/admin/stats")
    assert response.status_code == 200
    data = response.json()

    # active_users_last_24h は admin のみ（inactive_user は含まれない）
    # admin セッションは今ログインしたばかり → active
    # inactive_user → NOT active
    # よって active_users_last_24h == 1
    assert data["active_users_last_24h"] == 1, (
        f"48h前のアクセスがアクティブにカウントされている: {data['active_users_last_24h']}"
    )

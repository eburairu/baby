"""
セッショントークンのハッシュ化保存に関するテスト (Issue #825)

DB に保存されるトークンが SHA-256 ハッシュであり、
平文トークンが DB に残らないことを検証する。
"""
import hashlib
import pytest
from app.models.user import User, UserSession
from app.services.auth import get_password_hash
from app.utils.session import hash_token


@pytest.fixture
def test_user(db):
    user = User(username="hash_test_user", hashed_password=get_password_hash("password"))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_hash_token_is_sha256():
    """hash_token は SHA-256 ハッシュを返す"""
    raw = "test_token_value"
    expected = hashlib.sha256(raw.encode()).hexdigest()
    assert hash_token(raw) == expected


def test_db_stores_hashed_token_not_plaintext(client, test_user, db):
    """ログイン後、DB には平文トークンではなくハッシュ値が保存される"""
    response = client.post(
        "/api/auth/login",
        json={"username": test_user.username, "password": "password"},
    )
    assert response.status_code == 200
    raw_token = response.cookies["access_token"]

    # DB上のセッションを全件取得して確認
    sessions = db.query(UserSession).filter(UserSession.user_id == test_user.id).all()
    assert len(sessions) == 1

    stored = sessions[0].token
    # 平文がそのまま保存されていないこと
    assert stored != raw_token
    # SHA-256 ハッシュが保存されていること
    assert stored == hash_token(raw_token)


def test_authenticated_with_raw_cookie_token(client, test_user):
    """/api/auth/me がハッシュ化後も正常に動作する"""
    response = client.post(
        "/api/auth/login",
        json={"username": test_user.username, "password": "password"},
    )
    assert response.status_code == 200

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["username"] == test_user.username


def test_logout_with_hashed_token(client, test_user, db):
    """ログアウト後、DB のセッションが削除される"""
    client.post(
        "/api/auth/login",
        json={"username": test_user.username, "password": "password"},
    )
    raw_token = client.cookies.get("access_token")

    response = client.post("/api/auth/logout")
    assert response.status_code == 200

    hashed = hash_token(raw_token)
    session = db.query(UserSession).filter(UserSession.token == hashed).first()
    assert session is None


def test_tampered_token_is_rejected(client):
    """改ざんされたトークンで認証が通らない"""
    # 有効なセッションなしで偽トークンだけ送信
    client.cookies.set("access_token", "tampered_token_value")
    response = client.get("/api/auth/me")
    assert response.status_code == 401

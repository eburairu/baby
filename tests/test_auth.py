import pytest
from datetime import datetime, timedelta

def test_register_family(client):
    response = client.post(
        "/api/auth/register/family",
        json={
            "name": "Tanaka Family",
            "username": "tanaka",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Tanaka Family"
    assert "invite_code" in data
    invite_code = data["invite_code"]
    # Check for 16-character uppercase hex string (64-bit entropy)
    assert len(invite_code) == 16
    assert all(c in "0123456789ABCDEF" for c in invite_code)
    assert "access_token" in client.cookies

def test_login_success(client):
    # 登録
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Sato Family",
            "username": "sato",
            "password": "password123"
        }
    )
    # ログアウト相当（クッキー削除）
    client.cookies.clear()
    
    # ログイン
    response = client.post(
        "/api/auth/login",
        json={
            "username": "sato",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in client.cookies

def test_login_failure(client):
    response = client.post(
        "/api/auth/login",
        json={
            "username": "wronguser",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_get_me(auth_client):
    client = auth_client(username="meuser", password="password123")
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "meuser"

def test_logout(auth_client):
    client = auth_client()
    assert "access_token" in client.cookies
    
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert "access_token" not in client.cookies

def test_logout_with_endpoint_deletes_push_subscription(client, db):
    """ログアウト時に endpoint を渡すと対応する PushSubscription が論理削除される"""
    from app.models.notification import PushSubscription

    # ユーザー登録
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Push Family", "username": "pushuser", "password": "password123"},
    )
    assert res.status_code == 200

    # PushSubscription を登録
    endpoint = "https://push.example.com/test-endpoint"
    sub_res = client.post(
        "/api/notifications/subscribe",
        json={
            "endpoint": endpoint,
            "p256dh": "dummyp256dh",
            "auth": "dummyauth",
        },
    )
    assert sub_res.status_code == 200

    # ログアウト時に endpoint を渡す
    logout_res = client.post("/api/auth/logout", json={"endpoint": endpoint})
    assert logout_res.status_code == 200

    # PushSubscription が論理削除されていること（include_deleted=True で確認）
    sub = db.query(PushSubscription).execution_options(include_deleted=True).filter(PushSubscription.endpoint == endpoint).first()
    assert sub is not None
    assert sub.is_deleted is True


def test_logout_without_endpoint_works_as_before(client):
    """endpoint なしのログアウトは従来通り動作する"""
    client.post(
        "/api/auth/register/family",
        json={"name": "Nopush Family", "username": "nopushuser", "password": "password123"},
    )
    assert "access_token" in client.cookies

    response = client.post("/api/auth/logout", json={})
    assert response.status_code == 200
    assert "access_token" not in client.cookies


def test_join_family(client):
    # 家族作成
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Existing Family", "username": "admin", "password": "password123"}
    )
    invite_code = res.json()["invite_code"]
    client.cookies.clear()
    
    # 招待コードで参加
    response = client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={
            "username": "member",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert response.json()["username"] == "member"

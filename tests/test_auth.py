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

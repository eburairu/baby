import pytest
from fastapi.testclient import TestClient

def test_session_binding_success(client: TestClient):
    # Register to get a user
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Session Family 1",
            "username": "session_user_1",
            "password": "password123"
        }
    )
    client.cookies.clear()

    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "session_user_1", "password": "password123"},
        headers={"User-Agent": "TestBrowser/1.0", "X-Forwarded-For": "192.168.1.1"}
    )
    assert response.status_code == 200
    token = response.cookies.get("access_token")
    assert token is not None

    # Access with same IP and User-Agent
    client.cookies.set("access_token", token)
    response2 = client.get(
        "/api/auth/me",
        headers={"User-Agent": "TestBrowser/1.0", "X-Forwarded-For": "192.168.1.1"}
    )
    assert response2.status_code == 200

def test_session_binding_different_ip(client: TestClient):
    # Register to get a user
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Session Family 2",
            "username": "session_user_2",
            "password": "password123"
        }
    )
    client.cookies.clear()

    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "session_user_2", "password": "password123"},
        headers={"User-Agent": "TestBrowser/1.0", "X-Forwarded-For": "192.168.1.1"}
    )
    assert response.status_code == 200
    token = response.cookies.get("access_token")
    
    # Access with different IP
    client.cookies.set("access_token", token)
    response2 = client.get(
        "/api/auth/me",
        headers={"User-Agent": "TestBrowser/1.0", "X-Forwarded-For": "10.0.0.2"}
    )
    assert response2.status_code == 401

def test_session_binding_different_ua(client: TestClient):
    # Register to get a user
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Session Family 3",
            "username": "session_user_3",
            "password": "password123"
        }
    )
    client.cookies.clear()

    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "session_user_3", "password": "password123"},
        headers={"User-Agent": "TestBrowser/1.0", "X-Forwarded-For": "192.168.1.1"}
    )
    assert response.status_code == 200
    token = response.cookies.get("access_token")
    
    # Access with different User-Agent
    client.cookies.set("access_token", token)
    response2 = client.get(
        "/api/auth/me",
        headers={"User-Agent": "HackerBrowser/9.9", "X-Forwarded-For": "192.168.1.1"}
    )
    assert response2.status_code == 401

import pytest

def test_username_case_sensitivity(client):
    # 1. Register "CaseUser"
    username = "CaseUser"
    password = "Password123"

    res = client.post("/api/auth/register/family", json={
        "name": "Case Family",
        "username": username,
        "password": password
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"

    # Check current user (we should be logged in)
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 200
    created_username = res_me.json()["username"]
    print(f"Created username: {created_username}")

    # Assert normalization occurred
    assert created_username == username.lower(), "Username was not normalized on creation"

    # 2. Try to login as "caseuser" (lowercase) - Should SUCCESS
    # First logout/clear cookies to simulate fresh login
    client.cookies.clear()

    res = client.post("/api/auth/login", json={
        "username": username.lower(),
        "password": password
    })

    assert res.status_code == 200, "Login with lowercase username failed"
    assert res.json()["username"] == username.lower()

    # 3. Try to register "caseuser" (lowercase) - Should FAIL (Duplicate)
    res = client.post("/api/auth/register/family", json={
        "name": "Case Family 2",
        "username": username.lower(),
        "password": password
    })

    assert res.status_code == 400, "Duplicate registration succeeded (Vulnerability)"
    assert "Username already registered" in res.json()["detail"]

    # 4. Try to register "CASEUSER" (uppercase) - Should FAIL (Duplicate case-insensitive)
    res = client.post("/api/auth/register/family", json={
        "name": "Case Family 3",
        "username": username.upper(),
        "password": password
    })

    assert res.status_code == 400, "Duplicate registration (uppercase) succeeded (Vulnerability)"
    assert "Username already registered" in res.json()["detail"]

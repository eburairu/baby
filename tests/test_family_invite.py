import pytest

def test_regenerate_invite_code_as_admin(client):
    # Register as admin
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Admin Family", "username": "admin", "password": "password123"}
    )
    assert res.status_code == 200
    original_code = res.json()["invite_code"]

    # Verify original code format
    assert len(original_code) == 16
    assert all(c in "0123456789ABCDEF" for c in original_code)

    # Regenerate invite code
    res = client.post("/api/family/invite_code/regenerate")
    assert res.status_code == 200
    data = res.json()
    new_code = data["invite_code"]

    # Verify new code format and difference
    assert len(new_code) == 16
    assert all(c in "0123456789ABCDEF" for c in new_code)
    assert new_code != original_code

def test_regenerate_invite_code_as_viewer(client):
    # 1. Register family (creates admin)
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Viewer Family", "username": "admin", "password": "password123"}
    )
    invite_code = res.json()["invite_code"]

    # Logout admin
    client.cookies.clear()

    # 2. Join family as viewer
    res = client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={"username": "viewer", "password": "password123"}
    )
    assert res.status_code == 200

    # 3. Attempt to regenerate code
    res = client.post("/api/family/invite_code/regenerate")
    assert res.status_code == 403

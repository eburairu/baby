import pytest
from app.models.family import UserRole

def test_get_update_family(auth_client):
    # Register a new family and get the admin client
    client = auth_client(username="admin_user", password="password123", family_name="Test Family")

    # 1. Get family details
    response = client.get("/api/family/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Family"
    assert "invite_code" in data
    original_invite_code = data["invite_code"]

    # 2. Update family name
    response = client.patch("/api/family/", json={"name": "Updated Family Name"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Family Name"

    # Verify update persisted
    response = client.get("/api/family/")
    assert response.json()["name"] == "Updated Family Name"

    # 3. Update with empty name (should fail)
    response = client.patch("/api/family/", json={"name": "   "})
    assert response.status_code == 422

def test_regenerate_invite_code(auth_client):
    # Setup admin user
    client = auth_client(username="admin_user_2", password="password123", family_name="Regen Family")

    # Get original invite code
    response = client.get("/api/family/")
    original_code = response.json()["invite_code"]

    # Regenerate code
    response = client.post("/api/family/invite_code/regenerate")
    assert response.status_code == 200
    new_code = response.json()["invite_code"]
    assert new_code != original_code
    assert len(new_code) > 0

    # Verify new code is persisted
    response = client.get("/api/family/")
    assert response.json()["invite_code"] == new_code

def test_member_management(client):
    # 1. Register Admin User and Family
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Member Mgmt Family", "username": "admin_u", "password": "password123"}
    )
    assert res.status_code == 200
    invite_code = res.json()["invite_code"]

    # Login as Admin to get ID
    client.post("/api/auth/login", json={"username": "admin_u", "password": "password123"})
    admin_res = client.get("/api/auth/me")
    admin_id = admin_res.json()["id"]
    client.cookies.clear() # Logout

    # 2. Join as Viewer
    res = client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={"username": "viewer_u", "password": "password123"}
    )
    assert res.status_code == 200
    viewer_id = res.json()["id"]

    # Login as Viewer
    client.post("/api/auth/login", json={"username": "viewer_u", "password": "password123"})

    # Viewer cannot regenerate invite code
    res = client.post("/api/family/invite_code/regenerate")
    assert res.status_code == 403

    # Viewer cannot update role
    res = client.patch(f"/api/family/members/{viewer_id}/role", json={"role": "member"})
    assert res.status_code == 403

    client.cookies.clear() # Logout

    # 3. Login as Admin
    client.post("/api/auth/login", json={"username": "admin_u", "password": "password123"})

    # Get members
    res = client.get("/api/family/members")
    assert res.status_code == 200
    members = res.json()
    assert len(members) == 2

    # Promote Viewer to Member
    res = client.patch(f"/api/family/members/{viewer_id}/role", json={"role": "member"})
    assert res.status_code == 200
    assert res.json()["role"] == "member"

    # Verify promotion
    res = client.get("/api/family/members")
    target = next(m for m in res.json() if m["user_id"] == viewer_id)
    assert target["role"] == "member"

    # Try to demote last admin (self) -> Should fail
    res = client.patch(f"/api/family/members/{admin_id}/role", json={"role": "member"})
    assert res.status_code == 400
    assert "admin" in res.json()["detail"].lower()

    # Delete Member
    res = client.delete(f"/api/family/members/{viewer_id}")
    assert res.status_code == 204

    # Verify deletion
    res = client.get("/api/family/members")
    members = res.json()
    assert len(members) == 1
    assert members[0]["user_id"] == admin_id

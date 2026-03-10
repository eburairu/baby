import pytest
from app.models.user import User

def test_toggle_superadmin_success(auth_client, db):
    # 1. Register and login as a user
    client = auth_client(username="adminuser", password="password123")
    
    # 2. Make the current user a SuperAdmin directly in the DB
    admin_user = db.query(User).filter(User.username == "adminuser").first()
    admin_user.is_superadmin = True
    db.commit()
    
    # 3. Create another user to toggle
    from app.models.family import Family, FamilyUser, UserRole
    new_user = User(username="targetuser", hashed_password="hashed_password")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 4. Toggle superadmin for the target user using JSON body
    # This should succeed with our fix (Body vs Query mismatch)
    response = client.patch(
        f"/api/admin/users/{new_user.id}/superadmin",
        json={"is_superadmin": True}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["is_superadmin"] is True
    
    # Verify in DB
    db.refresh(new_user)
    assert new_user.is_superadmin is True

def test_toggle_superadmin_query_param_fails(auth_client, db):
    # This test verifies that it NO LONGER accepts query parameters if we use a schema
    # (Actually FastAPI might still accept them if not careful, but our goal is to support JSON body)
    
    client = auth_client(username="adminuser2", password="password123")
    admin_user = db.query(User).filter(User.username == "adminuser2").first()
    admin_user.is_superadmin = True
    db.commit()
    
    new_user = User(username="targetuser2", hashed_password="hashed_password")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Attempting with query param should fail (422) because the body is missing
    response = client.patch(
        f"/api/admin/users/{new_user.id}/superadmin?is_superadmin=true"
    )
    assert response.status_code == 422

def test_toggle_superadmin_self_demotion_prevention(auth_client, db):
    client = auth_client(username="selfadmin", password="password123")
    admin_user = db.query(User).filter(User.username == "selfadmin").first()
    admin_user.is_superadmin = True
    db.commit()
    
    # Attempt to demote self
    response = client.patch(
        f"/api/admin/users/{admin_user.id}/superadmin",
        json={"is_superadmin": False}
    )
    
    assert response.status_code == 400
    assert "Cannot demote yourself" in response.json()["detail"]

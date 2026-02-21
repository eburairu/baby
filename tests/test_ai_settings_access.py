
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.services.auth import get_password_hash

def test_superadmin_access_ai_settings(client: TestClient, db: Session):
    # 1. Create a SuperAdmin user who is NOT a family admin (or not in a family at all, or just a viewer)
    # Let's make them a Viewer in a family to be safe, but SuperAdmin = True
    
    # Family
    family = Family(name="Test Family", invite_code="TESTCODE")
    db.add(family)
    db.commit()
    
    # SuperAdmin User
    superadmin = User(
        username="superadmin_test",
        hashed_password=get_password_hash("password123"),
        is_superadmin=True
    )
    db.add(superadmin)
    db.commit()
    
    # Add as VIEWER (not ADMIN)
    family_user = FamilyUser(family_id=family.id, user_id=superadmin.id, role=UserRole.VIEWER)
    db.add(family_user)
    db.commit()
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "superadmin_test", "password": "password123"}
    )
    assert response.status_code == 200
    
    # 2. Try to access AI settings
    response = client.get("/api/ai/settings")
    
    # Before fix, this would be 403. After fix, it should be 200.
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}: {response.text}"
    data = response.json()
    assert "settings" in data
    assert "available_models" in data

def test_superadmin_update_ai_settings(client: TestClient, db: Session):
    # Reuse setup or similar logic
    family = Family(name="Test Family 2", invite_code="TESTCODE2")
    db.add(family)
    db.commit()
    
    superadmin = User(
        username="superadmin_update",
        hashed_password=get_password_hash("password123"),
        is_superadmin=True
    )
    db.add(superadmin)
    db.commit()
    
    family_user = FamilyUser(family_id=family.id, user_id=superadmin.id, role=UserRole.VIEWER)
    db.add(family_user)
    db.commit()
    
    client.post(
        "/api/auth/login",
        json={"username": "superadmin_update", "password": "password123"}
    )
    
    # Update settings
    payload = {
        "settings": {
            "llm_temperature": "0.5"
        }
    }
    response = client.patch("/api/ai/settings", json=payload)
    assert response.status_code == 200
    assert response.json()["message"].startswith("Updated")


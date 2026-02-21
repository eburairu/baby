
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby
from app.services.auth import get_password_hash

def test_superadmin_backend_auth_bypass(client: TestClient, db: Session):
    # 1. Setup: Create Family and SuperAdmin (Role: Viewer)
    family = Family(name="Test Family Auth", invite_code="TESTAUTH")
    db.add(family)
    db.commit()

    superadmin = User(
        username="superadmin_backend",
        hashed_password=get_password_hash("password123"),
        is_superadmin=True
    )
    db.add(superadmin)
    db.commit()

    # Add as VIEWER (not ADMIN)
    family_user = FamilyUser(family_id=family.id, user_id=superadmin.id, role=UserRole.VIEWER)
    db.add(family_user)
    db.commit()

    # Create a baby for testing permissions/updates
    baby = Baby(
        family_id=family.id,
        name="Test Baby",
        birthday=date(2023, 1, 1),
        gender="girl"
    )
    db.add(baby)
    db.commit()

    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "superadmin_backend", "password": "password123"}
    )
    assert response.status_code == 200

    # 2. Test Baby Management (POST /api/babies) - Should be allowed for SuperAdmin
    # Currently fails with 403
    response = client.post(
        "/api/babies/",
        json={
            "name": "New Baby",
            "birthday": "2024-01-01",
            "gender": "boy"
        }
    )
    # Expectation: 200 OK (after fix), currently 403
    if response.status_code == 403:
        pytest.fail("SuperAdmin blocked from creating baby (403 Forbidden)")
    assert response.status_code == 200

    # 3. Test Permission Management (GET /api/babies/{id}/permissions)
    response = client.get(f"/api/babies/{baby.id}/permissions")
    if response.status_code == 403:
        pytest.fail("SuperAdmin blocked from reading permissions (403 Forbidden)")
    assert response.status_code == 200

    # 4. Test Family Management (PATCH /api/family)
    response = client.patch(
        "/api/family/",
        json={"name": "Updated Family Name"}
    )
    if response.status_code == 403:
        pytest.fail("SuperAdmin blocked from updating family (403 Forbidden)")
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Family Name"

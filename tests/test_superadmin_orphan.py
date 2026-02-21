
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import date

from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby
from app.services.auth import get_password_hash

def test_superadmin_orphan_access(client: TestClient, db: Session):
    # 1. Setup: Create a random Family and Baby (which the SuperAdmin is NOT part of)
    family = Family(name="Target Family", invite_code="TARGET01")
    db.add(family)
    db.commit()

    baby = Baby(
        family_id=family.id,
        name="Target Baby",
        birthday=date(2023, 1, 1),
        gender="girl"
    )
    db.add(baby)
    db.commit()

    # 2. Setup: Create Orphan SuperAdmin (No Family)
    superadmin = User(
        username="superadmin_orphan",
        hashed_password=get_password_hash("password123"),
        is_superadmin=True
    )
    db.add(superadmin)
    db.commit()

    # Ensure SuperAdmin is NOT in the family (verify assumption)
    assert db.query(FamilyUser).filter(FamilyUser.user_id == superadmin.id).first() is None

    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "superadmin_orphan", "password": "password123"}
    )
    assert response.status_code == 200

    # 3. Test get_babies - Should return all babies (or at least the target one)
    # Currently: Returns [] because not in family
    response = client.get("/api/babies/")
    assert response.status_code == 200
    data = response.json()
    # Expectation: Should find the baby. Current behavior: Empty list.
    found = any(b["id"] == baby.id for b in data)
    if not found:
        pytest.fail("SuperAdmin (Orphan) could not see babies (got empty list or partial)")

    # 4. Test update_baby - Should succeed
    # Currently: 403 Forbidden ("Not in a family")
    response = client.patch(
        f"/api/babies/{baby.id}",
        json={"name": "Updated By SuperAdmin"}
    )
    if response.status_code == 403:
        pytest.fail("SuperAdmin (Orphan) blocked from updating baby (403 Forbidden)")
    assert response.status_code == 200
    assert response.json()["name"] == "Updated By SuperAdmin"

    # 5. Test get_records - Should succeed
    # Currently: 403 Forbidden (via verify_baby_access check inside or empty list due to permissions)
    # verify_baby_access in dependencies.py might raise 403 if not in family, UNLESS my previous fix covered it?
    # PR #237 fixed verify_baby_access to allow SuperAdmin even if not in family?
    # Let's check dependencies.py content in this worktree (which includes #237).
    
    response = client.get(f"/api/babies/{baby.id}/records")
    if response.status_code == 403:
        pytest.fail("SuperAdmin (Orphan) blocked from getting records (403 Forbidden)")
    assert response.status_code == 200

    # 6. Test delete_baby - Should succeed
    # Currently: 403 Forbidden
    response = client.delete(f"/api/babies/{baby.id}")
    if response.status_code == 403:
        pytest.fail("SuperAdmin (Orphan) blocked from deleting baby (403 Forbidden)")
    assert response.status_code == 204

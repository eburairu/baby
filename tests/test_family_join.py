import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
import uuid

def test_existing_user_join_family_rate_limit(client: TestClient, db: Session):
    # Setup user and families
    suffix = str(uuid.uuid4())[:8]
    user = User(username=f"user-{suffix}", hashed_password="hashed")
    db.add(user)
    db.flush()

    family_a = Family(name="Family A", invite_code=f"A-{suffix}".upper())
    family_b = Family(name="Family B", invite_code=f"B-{suffix}".upper())
    db.add_all([family_a, family_b])
    db.flush()

    db.add(FamilyUser(family_id=family_a.id, user_id=user.id, role=UserRole.ADMIN))
    db.commit()

    # Login by overriding dependency
    from app.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = lambda: user

    try:
        # Join family B
        res = client.post("/api/family/join", json={"invite_code": family_b.invite_code})
        assert res.status_code == 200
        assert res.json()["name"] == "Family B"

        # Try to join again should fail (Already a member)
        res = client.post("/api/family/join", json={"invite_code": family_b.invite_code})
        assert res.status_code == 400
        assert res.json()["detail"] == "Already a member of this family"

        # Test Rate Limiting
        for i in range(10): # Already made 2 requests above, so this will exceed 10 soon
            res = client.post("/api/family/join", json={"invite_code": "INVALID_CODE"})
            if res.status_code == 429:
                break
        
        # Verify 429 is reached
        res = client.post("/api/family/join", json={"invite_code": "INVALID_CODE"})
        assert res.status_code == 429
        assert "Too many join attempts" in res.json()["detail"]

    finally:
        app.dependency_overrides.clear()


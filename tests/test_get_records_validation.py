import pytest
from app.main import app
from app.dependencies import get_current_user
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby


@pytest.fixture
def auth_user(db):
    user = User(username="testuser", hashed_password="pw")
    db.add(user)
    db.commit()
    return user

def test_get_records_valid_limit(client, db, auth_user):
    family = Family(name="F1", invite_code="CODE1")
    db.add(family)
    db.commit()
    fu = FamilyUser(family_id=family.id, user_id=auth_user.id, role=UserRole.ADMIN)
    db.add(fu)
    baby = Baby(family_id=family.id, name="B1")
    db.add(baby)
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: auth_user
    response = client.get(f"/api/babies/{baby.id}/records?limit=10")
    assert response.status_code == 200

def test_get_records_negative_limit(client, auth_user):
    app.dependency_overrides[get_current_user] = lambda: auth_user
    response = client.get(f"/api/babies/1/records?limit=-1")
    assert response.status_code == 422

def test_get_records_zero_limit(client, auth_user):
    app.dependency_overrides[get_current_user] = lambda: auth_user
    response = client.get(f"/api/babies/1/records?limit=0")
    assert response.status_code == 422

def test_get_records_too_large_limit(client, auth_user):
    app.dependency_overrides[get_current_user] = lambda: auth_user
    response = client.get(f"/api/babies/1/records?limit=1001")
    assert response.status_code == 422


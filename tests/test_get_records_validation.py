import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies import get_db, get_current_user
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_validation.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def auth_user(test_db):
    user = User(username="testuser", hashed_password="pw")
    test_db.add(user)
    test_db.commit()
    return user

def test_get_records_valid_limit(client, test_db, auth_user):
    family = Family(name="F1", invite_code="CODE1")
    test_db.add(family)
    test_db.commit()
    fu = FamilyUser(family_id=family.id, user_id=auth_user.id, role=UserRole.ADMIN)
    test_db.add(fu)
    baby = Baby(family_id=family.id, name="B1")
    test_db.add(baby)
    test_db.commit()

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

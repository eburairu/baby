import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.models.baby import Baby, BabyPermission
from app.dependencies import get_current_user, get_db
import uuid

# Setup SQLite engine for this test file
sqlite_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)


# Global mock states
_mock_user = None
_test_db = None

def mock_get_db():
    yield _test_db

def mock_get_current_user():
    global _mock_user
    return _mock_user

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=sqlite_engine)
    yield
    Base.metadata.drop_all(bind=sqlite_engine)

@pytest.fixture(autouse=True)
def overrides():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_db] = mock_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def db():
    global _test_db
    connection = sqlite_engine.connect()
    transaction = connection.begin()
    _test_db = TestingSessionLocal(bind=connection)
    yield _test_db
    _test_db.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def setup_data(db: Session):
    suffix = str(uuid.uuid4())[:8]
    family = Family(name="Test Family", invite_code=f"TEST-{suffix}")
    db.add(family)
    db.flush()

    admin_user = User(id=2001, username=f"admin-{suffix}", hashed_password="hashed")
    db.add(admin_user)
    db.flush()
    db.add(FamilyUser(family_id=family.id, user_id=admin_user.id, role="admin"))

    member_user = User(id=2002, username=f"member-{suffix}", hashed_password="hashed")
    db.add(member_user)
    db.flush()
    db.add(FamilyUser(family_id=family.id, user_id=member_user.id, role="member"))

    baby = Baby(id=3001, family_id=family.id, name="Test Baby")
    db.add(baby)
    db.flush()

    db.commit()
    return {"admin": admin_user, "member": member_user, "baby": baby}

def test_get_permissions_as_admin(setup_data):
    global _mock_user
    admin = setup_data["admin"]
    baby = setup_data["baby"]
    member = setup_data["member"]
    
    _mock_user = admin
    client = TestClient(app)
    response = client.get(f"/api/babies/{baby.id}/permissions")
    
    assert response.status_code == 200
    data = response.json()
    assert data["baby_id"] == baby.id
    member_data = next(m for m in data["members"] if m["user_id"] == member.id)
    for p in member_data["permissions"]:
        assert p["can_view"] is True

def test_update_permissions_as_admin(setup_data):
    global _mock_user
    admin = setup_data["admin"]
    baby = setup_data["baby"]
    member = setup_data["member"]
    
    _mock_user = admin
    client = TestClient(app)
    update_data = {
        "permissions": [
            {"user_id": member.id, "record_type": "feeding", "can_view": False}
        ]
    }
    response = client.put(f"/api/babies/{baby.id}/permissions", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    member_data = next(m for m in data["members"] if m["user_id"] == member.id)
    feeding_perm = next(p for p in member_data["permissions"] if p["record_type"] == "feeding")
    assert feeding_perm["can_view"] is False

def test_access_denied_to_member(setup_data):
    global _mock_user
    admin = setup_data["admin"]
    baby = setup_data["baby"]
    member = setup_data["member"]
    
    # 1. Update permission to deny feeding access
    _mock_user = admin
    client = TestClient(app)
    client.put(f"/api/babies/{baby.id}/permissions", json={
        "permissions": [{"user_id": member.id, "record_type": "feeding", "can_view": False}]
    })
    
    # 2. Try to access as member
    _mock_user = member
    response = client.get(f"/api/feedings/?baby_id={baby.id}")
    
    assert response.status_code == 403
    assert "Access denied to feeding records" in response.json()["detail"]

def test_hide_baby_from_member(setup_data):
    global _mock_user
    admin = setup_data["admin"]
    baby = setup_data["baby"]
    member = setup_data["member"]
    
    # 1. Update permission to hide baby
    _mock_user = admin
    client = TestClient(app)
    client.put(f"/api/babies/{baby.id}/permissions", json={
        "permissions": [{"user_id": member.id, "record_type": "baby", "can_view": False}]
    })
    
    # 2. Member should not see the baby in list
    _mock_user = member
    response = client.get("/api/babies/")
    assert response.status_code == 200
    babies = response.json()
    assert all(b["id"] != baby.id for b in babies)

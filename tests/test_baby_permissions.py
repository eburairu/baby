import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.models.baby import Baby, BabyPermission
from app.dependencies import get_current_user, get_db
import uuid

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
    yield

@pytest.fixture(autouse=True)
def overrides():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_db] = mock_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def db():
    global _test_db
    connection = engine.connect()
    transaction = connection.begin()
    _test_db = SessionLocal(bind=connection)
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
    # デフォルト拒否: BabyPermissionレコードがない場合は can_view=False
    for p in member_data["permissions"]:
        assert p["can_view"] is False

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

def test_new_member_denied_by_default(setup_data):
    """デフォルト拒否: 権限なしのメンバーは赤ちゃんにアクセスできない"""
    global _mock_user
    baby = setup_data["baby"]
    member = setup_data["member"]

    # BabyPermissionレコードなしの状態でメンバーとしてアクセス
    _mock_user = member
    client = TestClient(app)
    response = client.get(f"/api/feedings/?baby_id={baby.id}")

    assert response.status_code == 403
    assert "Access denied to this baby" in response.json()["detail"]

def test_access_denied_when_feeding_permission_revoked(setup_data):
    """明示的な許可後に授乳権限を拒否すると403になる"""
    global _mock_user
    admin = setup_data["admin"]
    baby = setup_data["baby"]
    member = setup_data["member"]

    _mock_user = admin
    client = TestClient(app)

    # まず赤ちゃん + 授乳の閲覧を許可
    client.put(f"/api/babies/{baby.id}/permissions", json={
        "permissions": [
            {"user_id": member.id, "record_type": "baby", "can_view": True},
            {"user_id": member.id, "record_type": "feeding", "can_view": True},
        ]
    })

    # 次に授乳権限を拒否
    client.put(f"/api/babies/{baby.id}/permissions", json={
        "permissions": [
            {"user_id": member.id, "record_type": "feeding", "can_view": False}
        ]
    })

    # メンバーとして授乳記録へのアクセスを試みる
    _mock_user = member
    response = client.get(f"/api/feedings/?baby_id={baby.id}")

    assert response.status_code == 403
    assert "Access denied to feeding records" in response.json()["detail"]

def test_new_member_sees_no_babies(setup_data):
    """デフォルト拒否: 権限なしのメンバーは赤ちゃん一覧に表示されない"""
    global _mock_user
    baby = setup_data["baby"]
    member = setup_data["member"]

    _mock_user = member
    client = TestClient(app)
    response = client.get("/api/babies/")

    assert response.status_code == 200
    babies = response.json()
    # BabyPermissionレコードがないため、赤ちゃんは表示されない
    assert all(b["id"] != baby.id for b in babies)

def test_baby_visible_after_permission_granted(setup_data):
    """baby権限を付与した後、メンバーは赤ちゃんを閲覧できる"""
    global _mock_user
    admin = setup_data["admin"]
    baby = setup_data["baby"]
    member = setup_data["member"]

    _mock_user = admin
    client = TestClient(app)
    client.put(f"/api/babies/{baby.id}/permissions", json={
        "permissions": [{"user_id": member.id, "record_type": "baby", "can_view": True}]
    })

    _mock_user = member
    response = client.get("/api/babies/")

    assert response.status_code == 200
    babies = response.json()
    assert any(b["id"] == baby.id for b in babies)

def test_get_permissions_empty_members(db: Session):
    """メンバーがいない場合（adminのみの場合）に空リストが返ることを確認し、空のIN句によるエラーを防止する"""
    global _mock_user
    suffix = str(uuid.uuid4())[:8]
    family = Family(name="Solo Family", invite_code=f"SOLO-{suffix}")
    db.add(family)
    db.flush()

    admin_user = User(id=4001, username=f"soloadmin-{suffix}", hashed_password="hashed")
    db.add(admin_user)
    db.flush()
    db.add(FamilyUser(family_id=family.id, user_id=admin_user.id, role="admin"))

    baby = Baby(id=5001, family_id=family.id, name="Solo Baby")
    db.add(baby)
    db.flush()
    db.commit()

    _mock_user = admin_user
    client = TestClient(app)
    response = client.get(f"/api/babies/{baby.id}/permissions")

    assert response.status_code == 200
    data = response.json()
    assert data["baby_id"] == baby.id
    assert data["members"] == []


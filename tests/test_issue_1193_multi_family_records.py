"""
Issue #1193: GET /api/babies/{baby_id}/records の FamilyUser クエリに
family_id フィルタが欠如しており、複数ファミリー所属ユーザーで誤ったロールが参照される問題。
"""
import uuid
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.dependencies import get_current_user, get_db
from app.main import app
from app.models.baby import Baby, BabyPermission
from app.models.family import Family, FamilyUser
from app.models.enums import UserRole
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.user import User

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


def test_multi_family_admin_in_other_family_does_not_bypass_permissions(db: Session):
    """
    AC-1: ユーザーが Family A（ADMIN）と Family B（MEMBER）の両方に所属。
    Family B の赤ちゃんに feeding レコードのみ can_view=True、sleep は can_view=False。
    GET /api/babies/{baby_b_id}/records → feeding のみ返る（Family A の ADMIN 権限が漏れない）。
    """
    global _mock_user

    suffix = str(uuid.uuid4())[:8]
    user = User(username=f"user1193a-{suffix}", hashed_password="dummy_hash_for_testing")
    db.add(user)
    db.flush()

    # Family A: user は ADMIN
    family_a = Family(name=f"Family-A-{suffix}", invite_code=f"FA-{suffix}")
    db.add(family_a)
    db.flush()

    # Family B: user は MEMBER
    family_b = Family(name=f"Family-B-{suffix}", invite_code=f"FB-{suffix}")
    db.add(family_b)
    db.flush()

    baby_b = Baby(name="Baby B", family_id=family_b.id)
    db.add(baby_b)
    db.flush()

    # 意図的に Family A (ADMIN) を先に挿入して .first() で拾われやすくする
    db.add(FamilyUser(family_id=family_a.id, user_id=user.id, role=UserRole.ADMIN))
    db.add(FamilyUser(family_id=family_b.id, user_id=user.id, role=UserRole.MEMBER))
    db.flush()

    # Family B の baby_b に対して: baby レベルの can_view=True、feeding のみ True、sleep は False
    db.add(BabyPermission(baby_id=baby_b.id, user_id=user.id, record_type="baby", can_view=True))
    db.add(BabyPermission(baby_id=baby_b.id, user_id=user.id, record_type="feeding", can_view=True))
    db.add(BabyPermission(baby_id=baby_b.id, user_id=user.id, record_type="sleep", can_view=False))
    db.flush()

    # feeding レコードを追加
    feeding = Feeding(
        baby_id=baby_b.id,
        user_id=user.id,
        feeding_time=datetime(2024, 1, 1, 10, 0, tzinfo=timezone.utc),
        feeding_type="BOTTLE",
        amount_ml=100,
    )
    db.add(feeding)

    # sleep レコードを追加
    sleep = Sleep(
        baby_id=baby_b.id,
        user_id=user.id,
        start_time=datetime(2024, 1, 1, 9, 0, tzinfo=timezone.utc),
    )
    db.add(sleep)
    db.flush()
    db.commit()

    _mock_user = user
    client = TestClient(app)

    response = client.get(f"/api/babies/{baby_b.id}/records")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    records = response.json()
    record_types = {r["type"] for r in records}

    # feeding は表示される
    assert "feeding" in record_types, "feeding records should be visible"
    # sleep は can_view=False なので表示されない（Family A の ADMIN 権限が漏れていないことを確認）
    assert "sleep" not in record_types, (
        "Security violation: sleep records appeared, meaning Family A ADMIN role leaked into Family B"
    )


def test_multi_family_viewer_in_other_family_does_not_lose_admin(db: Session):
    """
    AC-2: ユーザーが Family A（VIEWER）と Family B（ADMIN）の両方に所属。
    Family B の赤ちゃんへの GET /api/babies/{baby_b_id}/records → 200 で全 record_type が取得できる。
    """
    global _mock_user

    suffix = str(uuid.uuid4())[:8]
    user = User(username=f"user1193b-{suffix}", hashed_password="dummy_hash_for_testing")
    db.add(user)
    db.flush()

    # Family A: user は VIEWER
    family_a = Family(name=f"Family-A-{suffix}", invite_code=f"FA2-{suffix}")
    db.add(family_a)
    db.flush()

    # Family B: user は ADMIN
    family_b = Family(name=f"Family-B-{suffix}", invite_code=f"FB2-{suffix}")
    db.add(family_b)
    db.flush()

    baby_b = Baby(name="Baby B2", family_id=family_b.id)
    db.add(baby_b)
    db.flush()

    # 意図的に Family A (VIEWER) を先に挿入して .first() で拾われやすくする
    db.add(FamilyUser(family_id=family_a.id, user_id=user.id, role=UserRole.VIEWER))
    db.add(FamilyUser(family_id=family_b.id, user_id=user.id, role=UserRole.ADMIN))
    db.flush()

    # feeding レコードを追加
    feeding = Feeding(
        baby_id=baby_b.id,
        user_id=user.id,
        feeding_time=datetime(2024, 1, 1, 10, 0, tzinfo=timezone.utc),
        feeding_type="BOTTLE",
        amount_ml=80,
    )
    db.add(feeding)

    # sleep レコードを追加
    sleep = Sleep(
        baby_id=baby_b.id,
        user_id=user.id,
        start_time=datetime(2024, 1, 1, 9, 0, tzinfo=timezone.utc),
    )
    db.add(sleep)
    db.flush()
    db.commit()

    _mock_user = user
    client = TestClient(app)

    response = client.get(f"/api/babies/{baby_b.id}/records")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    records = response.json()
    record_types = {r["type"] for r in records}

    # ADMIN なので BabyPermission なしで feeding も sleep も取得できる
    assert "feeding" in record_types, "ADMIN in Family B should see feeding records"
    assert "sleep" in record_types, "ADMIN in Family B should see sleep records"


def test_single_family_admin_still_works(db: Session):
    """
    AC-3 (リグレッション確認): 1ファミリーのみ所属の ADMIN。
    BabyPermission なしで GET /api/babies/{baby_id}/records → 200。
    """
    global _mock_user

    suffix = str(uuid.uuid4())[:8]
    user = User(username=f"user1193c-{suffix}", hashed_password="dummy_hash_for_testing")
    db.add(user)
    db.flush()

    family = Family(name=f"Family-{suffix}", invite_code=f"FC-{suffix}")
    db.add(family)
    db.flush()

    baby = Baby(name="Baby C", family_id=family.id)
    db.add(baby)
    db.flush()

    db.add(FamilyUser(family_id=family.id, user_id=user.id, role=UserRole.ADMIN))
    db.flush()

    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime(2024, 1, 1, 10, 0, tzinfo=timezone.utc),
        feeding_type="BOTTLE",
        amount_ml=120,
    )
    db.add(feeding)
    db.flush()
    db.commit()

    _mock_user = user
    client = TestClient(app)

    response = client.get(f"/api/babies/{baby.id}/records")
    assert response.status_code == 200, f"Regression: single-family ADMIN should get 200, got {response.status_code}: {response.text}"

    records = response.json()
    assert len(records) >= 1


def test_single_family_member_respects_permissions(db: Session):
    """
    AC-3 (リグレッション確認): 1ファミリーのみ所属の MEMBER。
    feeding のみ can_view=True で GET /api/babies/{baby_id}/records → feeding のみ返る。
    """
    global _mock_user

    suffix = str(uuid.uuid4())[:8]
    user = User(username=f"user1193d-{suffix}", hashed_password="dummy_hash_for_testing")
    db.add(user)
    db.flush()

    family = Family(name=f"Family-{suffix}", invite_code=f"FD-{suffix}")
    db.add(family)
    db.flush()

    baby = Baby(name="Baby D", family_id=family.id)
    db.add(baby)
    db.flush()

    db.add(FamilyUser(family_id=family.id, user_id=user.id, role=UserRole.MEMBER))
    db.add(BabyPermission(baby_id=baby.id, user_id=user.id, record_type="baby", can_view=True))
    db.add(BabyPermission(baby_id=baby.id, user_id=user.id, record_type="feeding", can_view=True))
    db.add(BabyPermission(baby_id=baby.id, user_id=user.id, record_type="sleep", can_view=False))
    db.flush()

    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime(2024, 1, 1, 10, 0, tzinfo=timezone.utc),
        feeding_type="BREAST",
        duration_minutes=15,
    )
    db.add(feeding)

    sleep = Sleep(
        baby_id=baby.id,
        user_id=user.id,
        start_time=datetime(2024, 1, 1, 9, 0, tzinfo=timezone.utc),
    )
    db.add(sleep)
    db.flush()
    db.commit()

    _mock_user = user
    client = TestClient(app)

    response = client.get(f"/api/babies/{baby.id}/records")
    assert response.status_code == 200, f"Regression: single-family MEMBER should get 200, got {response.status_code}: {response.text}"

    records = response.json()
    record_types = {r["type"] for r in records}

    assert "feeding" in record_types, "feeding should be visible"
    assert "sleep" not in record_types, "sleep should not be visible (can_view=False)"

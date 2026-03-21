"""
GET /api/babies/{baby_id}/records で返される
has_ai_feedback / has_ai_concern フラグのテスト
"""
import pytest
from datetime import datetime, timezone

from app.main import app
from app.dependencies import get_current_user
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby
from app.models.feeding import Feeding
from app.models.comment import RecordComment
from app.models.enums import FeedingType


@pytest.fixture
def setup(db):
    user = User(username="testflags", hashed_password="pw")
    db.add(user)
    db.commit()

    family = Family(name="FlagFamily", invite_code="FLAGCODE")
    db.add(family)
    db.commit()

    fu = FamilyUser(family_id=family.id, user_id=user.id, role=UserRole.ADMIN)
    db.add(fu)
    baby = Baby(family_id=family.id, name="FlagBaby")
    db.add(baby)
    db.commit()

    now = datetime.now(timezone.utc)
    feeding = Feeding(
        user_id=user.id,
        baby_id=baby.id,
        feeding_time=now,
        feeding_type=FeedingType.BREAST,
    )
    db.add(feeding)
    db.commit()

    return {"user": user, "baby": baby, "feeding": feeding}


def test_no_comments_no_flags(client, db, setup):
    """コメントなしの記録はフラグが両方 False"""
    app.dependency_overrides[get_current_user] = lambda: setup["user"]
    resp = client.get(f"/api/babies/{setup['baby'].id}/records?limit=10")
    assert resp.status_code == 200
    records = resp.json()
    feeding_record = next(r for r in records if r["type"] == "feeding")
    assert feeding_record["has_ai_feedback"] is False
    assert feeding_record["has_ai_concern"] is False


def test_ai_feedback_no_concern(client, db, setup):
    """AI フィードバックあり・警告なし → has_ai_feedback=True, has_ai_concern=False"""
    feeding = setup["feeding"]
    comment = RecordComment(
        baby_id=setup["baby"].id,
        record_type="feeding",
        record_id=feeding.id,
        content="問題ありません",
        is_ai_generated=True,
        ai_has_concern=False,
    )
    db.add(comment)
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: setup["user"]
    resp = client.get(f"/api/babies/{setup['baby'].id}/records?limit=10")
    assert resp.status_code == 200
    records = resp.json()
    feeding_record = next(r for r in records if r["type"] == "feeding")
    assert feeding_record["has_ai_feedback"] is True
    assert feeding_record["has_ai_concern"] is False


def test_ai_feedback_with_concern(client, db, setup):
    """AI フィードバックあり・警告あり → has_ai_feedback=True, has_ai_concern=True"""
    feeding = setup["feeding"]
    comment = RecordComment(
        baby_id=setup["baby"].id,
        record_type="feeding",
        record_id=feeding.id,
        content="授乳間隔が長すぎます",
        is_ai_generated=True,
        ai_has_concern=True,
    )
    db.add(comment)
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: setup["user"]
    resp = client.get(f"/api/babies/{setup['baby'].id}/records?limit=10")
    assert resp.status_code == 200
    records = resp.json()
    feeding_record = next(r for r in records if r["type"] == "feeding")
    assert feeding_record["has_ai_feedback"] is True
    assert feeding_record["has_ai_concern"] is True


def test_user_comment_only_no_ai_flags(client, db, setup):
    """ユーザーコメントのみ → フラグは両方 False、comment_count は 1"""
    user = setup["user"]
    feeding = setup["feeding"]
    comment = RecordComment(
        baby_id=setup["baby"].id,
        record_type="feeding",
        record_id=feeding.id,
        user_id=user.id,
        content="良い感じです",
        is_ai_generated=False,
    )
    db.add(comment)
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: setup["user"]
    resp = client.get(f"/api/babies/{setup['baby'].id}/records?limit=10")
    assert resp.status_code == 200
    records = resp.json()
    feeding_record = next(r for r in records if r["type"] == "feeding")
    assert feeding_record["has_ai_feedback"] is False
    assert feeding_record["has_ai_concern"] is False
    assert feeding_record["comment_count"] == 1

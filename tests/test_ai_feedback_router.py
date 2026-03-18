import pytest
from unittest.mock import patch
from datetime import datetime, timezone

from app.main import app
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.models.baby import Baby, BabyPermission
from app.models.feeding import Feeding
from app.models.enums import UserRole
from app.dependencies import get_current_user

@pytest.fixture
def test_user(db):
    user = User(username="test_user_ai_router", hashed_password="fake")
    db.add(user)
    db.commit()
    db.refresh(user)

    family = Family(name="Test Family", invite_code="TESTAIROUTER")
    db.add(family)
    db.commit()
    db.refresh(family)

    # FamilyUser の作成
    family_user = FamilyUser(family_id=family.id, user_id=user.id, role=UserRole.MEMBER)
    db.add(family_user)
    db.commit()

    return user

@pytest.mark.anyio
@patch("app.routers.ai_feedback.generate_record_feedback")
def test_create_record_feedback_success(mock_generate, client, db, test_user):
    # ベビーの作成
    baby = Baby(family_id=test_user.family_users[0].family_id, name="テストベビー", gender="boy", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    # BabyPermission の作成 (閲覧用)
    perm = BabyPermission(baby_id=baby.id, user_id=test_user.id, record_type="baby", can_view=True)
    db.add(perm)
    db.commit()
    
    # 記録の作成
    feeding = Feeding(
        baby_id=baby.id,
        user_id=test_user.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type="BREAST"
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)
    
    # モックの設定
    mock_generate.return_value = ("AIからのフィードバックです。", False, "gpt-test-model")
    
    # get_current_user のオーバーライド
    app.dependency_overrides[get_current_user] = lambda: test_user
    
    try:
        # リクエストの実行
        response = client.post(
            f"/api/babies/{baby.id}/record-feedback",
            json={
                "record_type": "feeding",
                "record_id": feeding.id
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["feedback"] == "AIからのフィードバックです。"
        assert data["has_concern"] is False
        assert "comment_id" in data
        assert data["record_type"] == "feeding"
    finally:
        app.dependency_overrides.clear()

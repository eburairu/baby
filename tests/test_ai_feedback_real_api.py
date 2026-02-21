import os
import pytest
from datetime import datetime, timezone, timedelta
from app.services.ai_feedback import generate_record_feedback
from app.models.family import Family, FamilyUser
from app.models.user import User
from app.models.baby import Baby
from app.models.feeding import Feeding

# LLM_API_KEY がない場合はスキップ
LLM_API_KEY = os.environ.get("LLM_API_KEY") or os.environ.get("OPENAI_API_KEY")

@pytest.mark.skipif(not LLM_API_KEY, reason="LLM_API_KEY is not set")
def test_generate_record_feedback_real_api(db):
    """
    実際に AI API (Gemini等) を呼び出してフィードバックが生成・パースされるか検証する。
    このテストは API キーがある環境でのみ実行される。
    """
    # 1. テストデータのセットアップ
    family = Family(name="Integration Test Family", invite_code="INTG-TEST")
    db.add(family)
    db.commit()
    db.refresh(family)

    user = User(username="intg_test_user", hashed_password="fake_password")
    db.add(user)
    db.commit()
    db.refresh(user)

    fu = FamilyUser(family_id=family.id, user_id=user.id, role="ADMIN")
    db.add(fu)

    baby = Baby(family_id=family.id, name="実機検証ベビー", gender="GIRL", birthday=datetime.now().date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    JST = timezone(timedelta(hours=9))
    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime.now(JST),
        feeding_type="BOTTLE",
        amount_ml=100,
        notes="テスト用: ミルクを飲みました"
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    # 2. 実行
    feedback, has_concern, model = generate_record_feedback(
        db, baby.id, baby.name, "feeding", feeding.id
    )

    # 3. 検証
    print(f"\n[Real API Test] Model: {model}")
    print(f"[Real API Test] Feedback: {feedback}")
    
    # 自然なテキストが返ってきているか（JSON 構造が露出していないか）
    assert isinstance(feedback, str)
    assert len(feedback) > 10
    
    # JSON構造が残っていないことを確認
    json_indicators = ['{"feedback":', '"has_concern":', '```json']
    for indicator in json_indicators:
        assert indicator not in feedback, f"Feedback still contains JSON indicator: {indicator}"
    
    # has_concern が boolean であるか
    assert isinstance(has_concern, bool)
    
    # モデル名が取得できているか
    assert model is not None
    assert len(model) > 0

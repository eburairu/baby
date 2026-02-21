import json
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime

from app.services.ai_feedback import _extract_json, generate_record_feedback
from app.models.family import Family
from app.models.user import User
from app.models.baby import Baby
from app.models.feeding import Feeding

# 1. 抽出ロジックのユニットテスト
def test_extract_json_logic():
    # 閉じフェンスの後にテキストがあるケース
    bad_response = """```json
{"feedback": "ミルクをしっかり飲めていて安心ですね。", "has_concern": false}
```
以上の内容でフィードバックを生成しました。"""
    
    extracted = _extract_json(bad_response)
    assert extracted == '{"feedback": "ミルクをしっかり飲めていて安心ですね。", "has_concern": false}'
    
    # コードブロックがないケース
    response = 'AIからの回答： {"feedback": "順調です", "has_concern": false} 以上です。'
    extracted = _extract_json(response)
    assert extracted == '{"feedback": "順調です", "has_concern": false}'

    # 単一行ブロック
    oneline = '```json {"feedback": "OK", "has_concern": false} ```'
    assert _extract_json(oneline) == '{"feedback": "OK", "has_concern": false}'

    # 生のJSON
    raw = '{"feedback": "raw", "has_concern": true}'
    assert _extract_json(raw) == raw

# 2. サービス関数のモックテスト
@patch("app.services.ai_feedback.get_llm_client")
@patch("app.services.ai_feedback.get_ai_config")
def test_generate_record_feedback_mock(mock_config, mock_get_client, db):
    # Setup
    mock_config.return_value = {"ai_enabled_feedback": True}
    
    mock_client = MagicMock()
    mock_get_client.return_value = (mock_client, "gpt-test-model")
    
    # 閉じフェンス後に余計なテキストがあるレスポンスを想定
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = """```json
{"feedback": "モックフィードバックです。", "has_concern": false}
```
追加のテキスト。"""
    mock_client.chat.completions.create.return_value = mock_response

    # テストデータ
    user = User(username="test_user_ai", hashed_password="fake")
    db.add(user)
    db.commit()
    family = Family(name="Test Family", invite_code="TEST-AI")
    db.add(family)
    db.commit()
    baby = Baby(family_id=family.id, name="テストベビー", gender="BOY", birthday=datetime.now().date())
    db.add(baby)
    db.commit()
    feeding = Feeding(
        baby_id=baby.id, 
        user_id=user.id,
        feeding_time=datetime.now(), 
        feeding_type="BREAST"
    )
    db.add(feeding)
    db.commit()

    # 実行
    feedback, has_concern, model = generate_record_feedback(
        db, baby.id, baby.name, "feeding", feeding.id
    )

    # 検証
    assert feedback == "モックフィードバックです。"
    assert has_concern is False
    assert model == "gpt-test-model"

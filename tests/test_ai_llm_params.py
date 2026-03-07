"""
Gemini モデルへの API 呼び出し時のパラメータ構築テスト。

背景:
- reasoning_effort="none" (デフォルト) を extra_body で送ると Flash モデルで 400 INVALID_ARGUMENT になる
- 思考モード (low/medium/high) 使用時は temperature=1.0 が必須（Pro Preview 制約）
"""
import pytest
from unittest.mock import MagicMock, patch, call
from datetime import date, datetime, timezone, timedelta

from app.services.ai_feedback import generate_record_feedback
from app.services.ai_summary import generate_daily_summary, update_baby_characteristics
from app.models.family import Family
from app.models.user import User
from app.models.baby import Baby
from app.models.feeding import Feeding


def _make_mock_response(content: str) -> MagicMock:
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = content
    return mock_response


# ── ai_feedback ──────────────────────────────────────────────────────────────

@patch("app.services.ai_feedback.get_llm_client")
@patch("app.services.ai_feedback.get_ai_config")
def test_feedback_no_extra_body_when_reasoning_effort_none(mock_config, mock_get_client, db):
    """reasoning_effort="none" のとき extra_body を送らない"""
    mock_config.return_value = {
        "ai_enabled_feedback": True,
        "llm_reasoning_effort": "none",
        "llm_temperature": 0.5,
        "llm_max_tokens": 200,
    }
    mock_client = MagicMock()
    mock_get_client.return_value = (mock_client, "gemini-2.0-flash")
    mock_client.chat.completions.create.return_value = _make_mock_response(
        '{"feedback": "OK", "has_concern": false}'
    )

    # テストデータ
    user = User(username="param_test_user", hashed_password="fake")
    db.add(user)
    db.commit()
    family = Family(name="Param Test Family", invite_code="PARAM1")
    db.add(family)
    db.commit()
    JST = timezone(timedelta(hours=9))
    baby = Baby(name="テスト児", family_id=family.id, birthday=date(2025, 1, 1))
    db.add(baby)
    db.commit()
    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime(2025, 3, 1, 10, 0, tzinfo=JST),
        feeding_type="BOTTLE",
        amount_ml=100,
    )
    db.add(feeding)
    db.commit()

    generate_record_feedback(db, baby.id, baby, "feeding", feeding.id)

    call_kwargs = mock_client.chat.completions.create.call_args[1]
    assert "extra_body" not in call_kwargs, (
        "reasoning_effort='none' のとき extra_body を送ってはいけない"
    )


@patch("app.services.ai_feedback.get_llm_client")
@patch("app.services.ai_feedback.get_ai_config")
def test_feedback_extra_body_and_temperature_when_thinking(mock_config, mock_get_client, db):
    """reasoning_effort="low" のとき extra_body を送り temperature=1.0 にする"""
    mock_config.return_value = {
        "ai_enabled_feedback": True,
        "llm_reasoning_effort": "low",
        "llm_temperature": 0.5,
        "llm_max_tokens": 200,
    }
    mock_client = MagicMock()
    mock_get_client.return_value = (mock_client, "gemini-2.5-pro-preview-05-06")
    mock_client.chat.completions.create.return_value = _make_mock_response(
        '{"feedback": "OK", "has_concern": false}'
    )

    user = User(username="param_test_user2", hashed_password="fake")
    db.add(user)
    db.commit()
    family = Family(name="Param Test Family2", invite_code="PARAM2")
    db.add(family)
    db.commit()
    JST = timezone(timedelta(hours=9))
    baby = Baby(name="テスト児2", family_id=family.id, birthday=date(2025, 1, 1))
    db.add(baby)
    db.commit()
    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime(2025, 3, 1, 10, 0, tzinfo=JST),
        feeding_type="BOTTLE",
        amount_ml=100,
    )
    db.add(feeding)
    db.commit()

    generate_record_feedback(db, baby.id, baby, "feeding", feeding.id)

    call_kwargs = mock_client.chat.completions.create.call_args[1]
    assert call_kwargs.get("extra_body") == {"reasoning_effort": "low"}, (
        "reasoning_effort='low' のとき extra_body を送る必要がある"
    )
    assert call_kwargs.get("temperature") == 1.0, (
        "思考モード時は temperature=1.0 が必須"
    )


# ── ai_summary (update_baby_characteristics) ─────────────────────────────────

@patch("app.services.ai_summary.get_llm_client")
@patch("app.services.ai_summary.get_ai_config")
def test_characteristics_no_extra_body_when_reasoning_effort_none(mock_config, mock_get_client, db):
    """update_baby_characteristics: reasoning_effort="none" のとき extra_body を送らない"""
    mock_config.return_value = {
        "llm_reasoning_effort": "none",
        "llm_temperature": 0.5,
        "llm_max_tokens": 200,
    }
    mock_client = MagicMock()
    mock_get_client.return_value = (mock_client, "gemini-2.0-flash")
    mock_client.chat.completions.create.return_value = _make_mock_response("よく飲む")

    family = Family(name="Char Test Family", invite_code="CHAR1")
    db.add(family)
    db.commit()
    baby = Baby(name="テスト児3", family_id=family.id, birthday=date(2025, 1, 1))
    db.add(baby)
    db.commit()

    update_baby_characteristics(
        db, baby.id, baby.name, date(2025, 3, 1),
        "現在の特徴なし", "記録テキスト", "生成された日記", "gemini-2.0-flash"
    )

    call_kwargs = mock_client.chat.completions.create.call_args[1]
    assert "extra_body" not in call_kwargs, (
        "reasoning_effort='none' のとき extra_body を送ってはいけない"
    )


@patch("app.services.ai_summary.get_llm_client")
@patch("app.services.ai_summary.get_ai_config")
def test_characteristics_extra_body_and_temperature_when_thinking(mock_config, mock_get_client, db):
    """update_baby_characteristics: reasoning_effort="medium" のとき extra_body と temperature=1.0"""
    mock_config.return_value = {
        "llm_reasoning_effort": "medium",
        "llm_temperature": 0.7,
        "llm_max_tokens": 200,
    }
    mock_client = MagicMock()
    mock_get_client.return_value = (mock_client, "gemini-2.5-pro-preview-05-06")
    mock_client.chat.completions.create.return_value = _make_mock_response("よく飲む")

    family = Family(name="Char Test Family2", invite_code="CHAR2")
    db.add(family)
    db.commit()
    baby = Baby(name="テスト児4", family_id=family.id, birthday=date(2025, 1, 1))
    db.add(baby)
    db.commit()

    update_baby_characteristics(
        db, baby.id, baby.name, date(2025, 3, 1),
        "現在の特徴なし", "記録テキスト", "生成された日記", "gemini-2.5-pro-preview-05-06"
    )

    call_kwargs = mock_client.chat.completions.create.call_args[1]
    assert call_kwargs.get("extra_body") == {"reasoning_effort": "medium"}
    assert call_kwargs.get("temperature") == 1.0

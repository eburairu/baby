"""
Issue #994: AI日誌手動編集済みレコードへのPOSTでレート制限が不当に消費されるバグの修正テスト

create_or_get_daily_summary エンドポイントは、is_edited=True のレコードが存在する場合、
AI生成を行わずに既存レコードをそのまま返す。
このとき daily_summary_limiter.check() が呼ばれてはならない。
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import date

from app.models.ai_summary import DailySummary
import app.routers.ai_summary as ai_summary_router


def test_rate_limit_not_applied_when_edited_summary_exists(client, auth_client, db):
    """is_edited=True のレコードが存在する場合、レート制限が消費されないこと"""
    c = auth_client()
    resp = c.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    assert resp.status_code in (200, 201)
    baby_id = resp.json()["id"]

    summary_date = date(2025, 12, 1)

    # is_edited=True のレコードを直接DBに作成
    summary = DailySummary(
        baby_id=baby_id,
        summary_date=summary_date,
        generated_content="AI生成内容",
        edited_content="手動編集内容",
        is_edited=True,
    )
    db.add(summary)
    db.commit()

    # daily_summary_limiter.check をスパイして呼び出し回数を追跡
    with patch.object(ai_summary_router.daily_summary_limiter, "check", wraps=ai_summary_router.daily_summary_limiter.check) as mock_check:
        resp = c.post(
            f"/api/babies/{baby_id}/daily-summary",
            json={"summary_date": "2025-12-01"},
        )

    assert resp.status_code == 201  # endpoint は常に 201 を返す
    assert resp.json()["is_edited"] is True
    # is_edited=True なので AI 生成不要 → レート制限を消費してはならない
    mock_check.assert_not_called()


def test_rate_limit_applied_when_ai_generation_needed(client, auth_client, db):
    """既存レコードがない場合はレート制限チェックが実行されること"""
    c = auth_client()
    resp = c.post("/api/babies/", json={"name": "Test Baby 2", "gender": "girl"})
    assert resp.status_code in (200, 201)
    baby_id = resp.json()["id"]

    # generate_daily_summary をモックしてAIコールを回避
    mock_content = "モック生成内容"
    mock_model = "gpt-test"

    with patch("app.routers.ai_summary.generate_daily_summary", return_value=(mock_content, mock_model)):
        with patch.object(ai_summary_router.daily_summary_limiter, "check", wraps=ai_summary_router.daily_summary_limiter.check) as mock_check:
            resp = c.post(
                f"/api/babies/{baby_id}/daily-summary",
                json={"summary_date": "2025-11-01"},
            )

    assert resp.status_code == 201
    # AI生成が必要なケース → レート制限チェックが1回呼ばれること
    mock_check.assert_called_once()

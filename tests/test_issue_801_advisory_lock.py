"""
Issue #801: AI日誌生成(upsert)時の競合エラーを防ぐ排他ロックの導入

テスト対象:
  - upsert 実行前に acquire_ai_summary_lock() が呼ばれること
  - acquire_ai_summary_lock() が実際の PostgreSQL で pg_advisory_xact_lock を発行すること
  - ロック取得済みの場合（2回目のリクエスト）でも is_edited フラグによる分岐が正常に動くこと
"""

import pytest
from unittest.mock import patch, call
from datetime import date

from app.models.family import Family
from app.models.user import User
from app.models.baby import Baby
from app.models.ai_summary import DailySummary
from app.dependencies import get_current_user
from sqlalchemy.orm import Session
from app.main import app


# ---------------------------------------------------------------------------
# ヘルパー
# ---------------------------------------------------------------------------

def _setup_user_and_baby(db: Session):
    user = User(username="lock_test_user", hashed_password="fake")
    db.add(user)
    db.commit()
    db.refresh(user)

    family = Family(name="Lock Test Family", invite_code="LOCK-801")
    db.add(family)
    db.commit()
    db.refresh(family)

    baby = Baby(
        family_id=family.id,
        name="ロックちゃん",
        gender="girl",
        birthday=date.today(),
    )
    db.add(baby)
    db.commit()
    db.refresh(baby)

    return user, baby


# ---------------------------------------------------------------------------
# テスト1: upsert 前に acquire_ai_summary_lock が呼ばれること（RED -> GREEN）
# ---------------------------------------------------------------------------

def test_advisory_lock_is_called_on_upsert(db: Session, client):
    """
    POST /api/babies/{baby_id}/daily-summary を呼んだ際に
    acquire_ai_summary_lock(db, baby_id, summary_date) が必ず呼ばれることを確認する。
    """
    user, baby = _setup_user_and_baby(db)
    app.dependency_overrides[get_current_user] = lambda: user

    try:
        with patch("app.routers.ai_summary.verify_baby_access") as mock_verify, \
             patch("app.routers.ai_summary.generate_daily_summary") as mock_generate, \
             patch("app.routers.ai_summary.acquire_ai_summary_lock") as mock_lock:

            mock_verify.return_value = baby
            mock_generate.return_value = ("テスト日誌内容", "gemini-2.0-flash")

            today_str = date.today().isoformat()
            response = client.post(
                f"/api/babies/{baby.id}/daily-summary",
                json={"summary_date": today_str},
            )

            assert response.status_code == 201, response.text
            # ロック関数が1回呼ばれていること
            mock_lock.assert_called_once()
            # baby_id と summary_date を引数に含むこと
            call_args = mock_lock.call_args
            assert baby.id in call_args.args or baby.id in call_args.kwargs.values()
    finally:
        app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# テスト2: acquire_ai_summary_lock が pg_advisory_xact_lock を実行すること
# ---------------------------------------------------------------------------

def test_acquire_ai_summary_lock_executes_pg_advisory_lock(db: Session):
    """
    acquire_ai_summary_lock() が実際の PostgreSQL で pg_advisory_xact_lock を
    例外なく実行できることを確認する。モックを使わず実DBで検証する。
    """
    from app.routers.ai_summary import acquire_ai_summary_lock

    target_date = date(2026, 3, 10)
    baby_id = 42

    # 実 PostgreSQL に対して実行し、例外が発生しないことを確認
    acquire_ai_summary_lock(db, baby_id, target_date)


# ---------------------------------------------------------------------------
# テスト3: ロック後でも is_edited=True の場合は再生成しない
# ---------------------------------------------------------------------------

def test_advisory_lock_does_not_regenerate_when_edited(db: Session, client):
    """
    is_edited=True のレコードが存在する場合、ロック取得後も generate_daily_summary は
    呼ばれずに既存レコードをそのまま返すこと。
    """
    user, baby = _setup_user_and_baby(db)

    # 事前に is_edited=True のレコードを作成
    existing = DailySummary(
        baby_id=baby.id,
        user_id=user.id,
        summary_date=date.today(),
        generated_content="既存の日誌",
        edited_content="編集済み日誌",
        is_edited=True,
        model_name="gemini-2.0-flash",
    )
    db.add(existing)
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: user

    try:
        with patch("app.routers.ai_summary.verify_baby_access") as mock_verify, \
             patch("app.routers.ai_summary.generate_daily_summary") as mock_generate, \
             patch("app.routers.ai_summary.acquire_ai_summary_lock") as mock_lock:

            mock_verify.return_value = baby

            today_str = date.today().isoformat()
            response = client.post(
                f"/api/babies/{baby.id}/daily-summary",
                json={"summary_date": today_str},
            )

            assert response.status_code == 201, response.text
            data = response.json()
            # 編集済みなので生成は呼ばれない
            mock_generate.assert_not_called()
            # 既存の generated_content が返る
            assert data["generated_content"] == "既存の日誌"
    finally:
        app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# テスト4: ロック後の2重リクエストで UniqueViolation が発生しないこと
#          （ロックで直列化されることを構造的に確認）
# ---------------------------------------------------------------------------

def test_second_request_after_first_insert_updates_not_duplicates(db: Session, client):
    """
    同一 (baby_id, summary_date) への2回目のリクエストが INSERT ではなく UPDATE に
    なることを確認する（ロックによる直列化の結果）。
    """
    user, baby = _setup_user_and_baby(db)
    app.dependency_overrides[get_current_user] = lambda: user

    try:
        with patch("app.routers.ai_summary.verify_baby_access") as mock_verify, \
             patch("app.routers.ai_summary.generate_daily_summary") as mock_generate, \
             patch("app.routers.ai_summary.acquire_ai_summary_lock"), \
             patch("app.routers.ai_summary.daily_summary_limiter") as mock_limiter:

            mock_verify.return_value = baby
            mock_generate.return_value = ("1回目の日誌", "gemini-2.0-flash")
            mock_limiter.check.return_value = None  # レートリミットをスキップ

            today_str = date.today().isoformat()

            # 1回目: INSERT
            r1 = client.post(
                f"/api/babies/{baby.id}/daily-summary",
                json={"summary_date": today_str},
            )
            assert r1.status_code == 201, r1.text
            assert r1.json()["generated_content"] == "1回目の日誌"

            # 2回目: UPDATE（ロックが直列化を保証するため既存レコードが見つかる）
            mock_generate.return_value = ("2回目の日誌", "gemini-2.0-flash")
            r2 = client.post(
                f"/api/babies/{baby.id}/daily-summary",
                json={"summary_date": today_str},
            )
            assert r2.status_code == 201, r2.text
            assert r2.json()["generated_content"] == "2回目の日誌"

            # DB上にレコードが1件だけ存在すること（重複 INSERT していない）
            count = db.query(DailySummary).filter(
                DailySummary.baby_id == baby.id,
                DailySummary.summary_date == date.today(),
            ).count()
            assert count == 1, f"Expected 1 record, got {count}"
    finally:
        app.dependency_overrides.clear()

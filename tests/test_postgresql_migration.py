"""
Issue #949: テスト環境のPostgreSQL完全移行を検証するテスト

これらのテストはPostgreSQL固有の機能が実際のDBで動作することを確認する。
SQLite環境では全て失敗する（PostgreSQL専用構文を使用するため）。
"""

import pytest
from datetime import date
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.baby import Baby
from app.models.family import Family
from app.models.user import User
from app.models.ai_summary import DailySummary
from app.routers.ai_summary import acquire_ai_summary_lock


class TestPostgresqlAdvisoryLock:
    """pg_advisory_xact_lock が実PostgreSQLで動作することを確認する"""

    def test_advisory_lock_executes_on_real_postgresql(self, db: Session):
        """
        acquire_ai_summary_lock() が実際のPostgreSQLで例外なく実行できること。
        SQLiteでは pg_advisory_xact_lock が存在しないため失敗する。
        """
        acquire_ai_summary_lock(db, baby_id=1, summary_date=date(2026, 1, 1))
        # 例外が発生しなければ pg_advisory_xact_lock がPostgreSQL上で成功した証明

    def test_advisory_lock_different_keys_no_conflict(self, db: Session):
        """異なるキーでのロック取得が干渉しないこと"""
        acquire_ai_summary_lock(db, baby_id=1, summary_date=date(2026, 1, 1))
        acquire_ai_summary_lock(db, baby_id=2, summary_date=date(2026, 1, 1))
        acquire_ai_summary_lock(db, baby_id=1, summary_date=date(2026, 1, 2))
        # 全て例外なく完了すること


class TestPostgresqlJsonb:
    """JSONB型カラムが実PostgreSQLで動作することを確認する"""

    def test_jsonb_upsert_on_real_postgresql(self, db: Session):
        """
        DailySummaryのinsert(postgresql方言)が実PostgreSQLで動作すること。
        SQLiteでは postgresql.insert が使えないため失敗する。
        """
        from sqlalchemy.dialects.postgresql import insert as pg_insert

        user = User(username="pg_test_user_jsonb", hashed_password="fake")
        db.add(user)
        db.flush()

        family = Family(name="PG Test Family", invite_code="PG-JSONB-001")
        db.add(family)
        db.flush()

        baby = Baby(
            family_id=family.id,
            name="PGテスト",
            gender="boy",
            birthday=date(2024, 1, 1),
        )
        db.add(baby)
        db.flush()

        stmt = pg_insert(DailySummary).values(
            baby_id=baby.id,
            user_id=user.id,
            summary_date=date(2026, 1, 1),
            generated_content="テスト日誌",
            model_name="test-model",
        ).on_conflict_do_update(
            index_elements=["baby_id", "summary_date"],
            index_where=text("is_deleted = false"),
            set_={"generated_content": "更新日誌"},
        )
        db.execute(stmt)
        db.flush()

        record = db.query(DailySummary).filter(
            DailySummary.baby_id == baby.id,
            DailySummary.summary_date == date(2026, 1, 1),
        ).first()
        assert record is not None
        assert record.generated_content == "テスト日誌"


class TestPostgresqlDialectVerification:
    """テストDBが実際にPostgreSQLであることを確認する"""

    def test_db_dialect_is_postgresql(self, db: Session):
        """
        テストDBのdialectがpostgresqlであること。
        Testcontainersが正しく起動していれば常にGREEN。
        """
        result = db.execute(text("SELECT version()")).scalar()
        assert result is not None
        assert "PostgreSQL" in result, f"Expected PostgreSQL, got: {result}"

    def test_postgresql_specific_function_available(self, db: Session):
        """PostgreSQL固有関数(pg_backend_pid)が使えること"""
        result = db.execute(text("SELECT pg_backend_pid()")).scalar()
        assert isinstance(result, int)
        assert result > 0

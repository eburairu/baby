"""
SoftDeleteMixin の is_deleted カラムに単独インデックスが存在しないことを確認するテスト。
複合インデックス（baby_id + is_deleted 等）は各モデルで定義済みのため、
単独インデックスは不要で排除すべき。
"""
import pytest
from sqlalchemy import inspect
from tests.conftest import engine
from app.models.base import Base
import app.models  # noqa: F401 - 全モデルをロード


# SoftDeleteMixinを継承するモデルのテーブル名一覧
SOFT_DELETE_TABLES = [
    "feedings",
    "diapers",
    "sleeps",
    "growths",
    "notes",
    "babies",
    "families",
    "contractions",
    "daily_summaries",
    "schedules",
    "vaccinations",
    "temperature_records",
    "record_comments",
    "milestones",
    "app_notifications",
    "push_subscriptions",
]


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_no_single_column_is_deleted_index(setup_db):
    """SoftDeleteMixinを継承する全テーブルで is_deleted の単独インデックスが存在しないこと"""
    inspector = inspect(engine)
    violations = []

    for table_name in SOFT_DELETE_TABLES:
        indexes = inspector.get_indexes(table_name)
        for idx in indexes:
            cols = idx["column_names"]
            # is_deleted のみからなる単独インデックスは存在してはならない
            if cols == ["is_deleted"]:
                violations.append(f"{table_name}: single-column index on is_deleted found (name={idx['name']})")

    assert not violations, (
        "以下のテーブルに不要な is_deleted 単独インデックスが存在します:\n"
        + "\n".join(violations)
    )


def test_composite_is_deleted_index_exists(setup_db):
    """各テーブルに is_deleted を含む複合インデックスが存在すること"""
    inspector = inspect(engine)
    missing = []

    for table_name in SOFT_DELETE_TABLES:
        indexes = inspector.get_indexes(table_name)
        has_composite = any(
            "is_deleted" in idx["column_names"] and len(idx["column_names"]) > 1
            for idx in indexes
        )
        if not has_composite:
            missing.append(table_name)

    assert not missing, (
        "以下のテーブルに is_deleted を含む複合インデックスがありません:\n"
        + "\n".join(missing)
    )

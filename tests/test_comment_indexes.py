import pytest
from sqlalchemy import inspect
from tests.conftest import engine
from app.models.base import Base
from app.models.comment import RecordComment

@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_comment_indexes(setup_db):
    """RecordCommentのインデックスが正しく作成されているか確認"""
    inspector = inspect(engine)
    indexes = inspector.get_indexes("record_comments")

    index_map = {idx["name"]: idx["column_names"] for idx in indexes}

    # 複合インデックスの存在確認
    assert "idx_comment_record" in index_map, "idx_comment_record missing"
    assert index_map["idx_comment_record"] == ["record_type", "record_id"]

    # baby_id単体のインデックスも確認
    # 名前は環境依存の可能性があるため、カラム構成で探す
    baby_id_index_exists = any(idx["column_names"] == ["baby_id"] for idx in indexes)
    assert baby_id_index_exists, "baby_id single column index missing"

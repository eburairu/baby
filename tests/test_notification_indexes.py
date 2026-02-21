import pytest
from sqlalchemy import inspect
from tests.conftest import engine
from app.models.base import Base
# モデルをインポートしてmetadataに登録させる
from app.models.user import User
from app.models.notification import AppNotification, PushSubscription

@pytest.fixture(scope="function")
def setup_db():
    # テーブル作成
    Base.metadata.create_all(bind=engine)
    yield
    # テーブル削除
    Base.metadata.drop_all(bind=engine)

def test_app_notification_indexes(setup_db):
    """AppNotificationのインデックスが正しく作成されているか確認"""
    inspector = inspect(engine)

    # デバッグ用にテーブル一覧を出力
    print(f"Existing tables: {inspector.get_table_names()}")

    indexes = inspector.get_indexes("app_notifications")

    index_map = {idx["name"]: idx["column_names"] for idx in indexes}

    # 複合インデックスの存在確認
    assert "idx_app_notifications_user_created" in index_map, "idx_app_notifications_user_created missing"
    assert index_map["idx_app_notifications_user_created"] == ["user_id", "created_at"]

    assert "idx_app_notifications_user_unread" in index_map, "idx_app_notifications_user_unread missing"
    # This index is created by an older migration (0332ddd5a74c) and includes created_at
    assert index_map["idx_app_notifications_user_unread"] == ["user_id", "is_read", "created_at"]

    # user_id単体のインデックスも確認
    # 名前は環境依存の可能性があるため、カラム構成で探す
    user_id_index_exists = any(idx["column_names"] == ["user_id"] for idx in indexes)
    assert user_id_index_exists, "user_id single column index missing"

def test_push_subscription_indexes(setup_db):
    """PushSubscriptionのインデックスが正しく作成されているか確認"""
    inspector = inspect(engine)
    indexes = inspector.get_indexes("push_subscriptions")

    # user_idのインデックス確認
    user_id_index_exists = any(idx["column_names"] == ["user_id"] for idx in indexes)
    assert user_id_index_exists, "PushSubscription user_id index missing"

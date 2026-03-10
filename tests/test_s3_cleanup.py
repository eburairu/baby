"""レコード削除時のS3/R2画像クリーンアップ処理のテスト"""
import pytest
from datetime import date
from unittest.mock import patch, MagicMock
from app.models.baby import Baby
from app.models.family import FamilyUser
from app.models.milestone import Milestone
from app.models.ai_summary import DailySummary
from app.utils.s3 import delete_s3_objects


# --- Unit tests for delete_s3_objects ---

def test_delete_s3_objects_calls_delete_object():
    """delete_s3_objects はキーごとに delete_object を呼び出す。"""
    mock_client = MagicMock()
    with patch("app.utils.s3._get_s3_client", return_value=mock_client):
        with patch.dict("os.environ", {"R2_BUCKET_NAME": "test-bucket"}):
            delete_s3_objects(["key1.jpg", "key2.jpg"])
    assert mock_client.delete_object.call_count == 2
    mock_client.delete_object.assert_any_call(Bucket="test-bucket", Key="key1.jpg")
    mock_client.delete_object.assert_any_call(Bucket="test-bucket", Key="key2.jpg")


def test_delete_s3_objects_empty_list():
    """delete_s3_objects は空リストで S3 クライアントを呼ばない。"""
    with patch("app.utils.s3._get_s3_client") as mock_get_client:
        delete_s3_objects([])
    mock_get_client.assert_not_called()


def test_delete_s3_objects_no_client():
    """delete_s3_objects は S3 クライアントが取得できない場合でもエラーにならない。"""
    with patch("app.utils.s3._get_s3_client", return_value=None):
        delete_s3_objects(["key1.jpg"])  # エラーにならないこと


def test_delete_s3_objects_handles_client_error():
    """delete_s3_objects は ClientError が発生しても処理を継続する。"""
    from botocore.exceptions import ClientError
    mock_client = MagicMock()
    mock_client.delete_object.side_effect = ClientError(
        {"Error": {"Code": "NoSuchKey", "Message": "Not found"}}, "DeleteObject"
    )
    with patch("app.utils.s3._get_s3_client", return_value=mock_client):
        with patch.dict("os.environ", {"R2_BUCKET_NAME": "test-bucket"}):
            delete_s3_objects(["missing_key.jpg"])  # エラーにならないこと


# --- Helper ---

def _setup(auth_client, db, username):
    client = auth_client(username=username, password="password123")
    user_id = client.get("/api/auth/me").json()["id"]
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    baby = Baby(family_id=fu.family_id, name="Cleanup Baby", birthday=date(2026, 1, 1))
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return client, baby


# --- Milestone deletion ---

@patch("app.routers.milestones.delete_s3_objects")
def test_delete_milestone_triggers_s3_cleanup(mock_delete, auth_client, db):
    """マイルストーン削除時に画像の S3 クリーンアップが BackgroundTasks 経由で実行される。"""
    client, baby = _setup(auth_client, db, "s3milestone1")
    milestone = Milestone(
        baby_id=baby.id,
        milestone_type="rolling_over",
        title="寝返り",
        achieved_date=date(2026, 3, 1),
        image_urls=["key1.jpg", "key2.jpg"],
    )
    db.add(milestone)
    db.commit()

    response = client.delete(f"/api/milestones/{milestone.id}")
    assert response.status_code == 204
    mock_delete.assert_called_once_with(["key1.jpg", "key2.jpg"])


@patch("app.routers.milestones.delete_s3_objects")
def test_delete_milestone_no_images_skips_cleanup(mock_delete, auth_client, db):
    """画像なしのマイルストーン削除では S3 クリーンアップを実行しない。"""
    client, baby = _setup(auth_client, db, "s3milestone2")
    milestone = Milestone(
        baby_id=baby.id,
        milestone_type="sitting_up",
        title="お座り",
        achieved_date=date(2026, 3, 2),
        image_urls=[],
    )
    db.add(milestone)
    db.commit()

    response = client.delete(f"/api/milestones/{milestone.id}")
    assert response.status_code == 204
    mock_delete.assert_not_called()


# --- DailySummary deletion ---

@patch("app.routers.ai_summary.delete_s3_objects")
def test_delete_daily_summary_triggers_s3_cleanup(mock_delete, auth_client, db):
    """AI 日誌削除時に画像の S3 クリーンアップが BackgroundTasks 経由で実行される。"""
    client, baby = _setup(auth_client, db, "s3summary1")
    summary = DailySummary(
        baby_id=baby.id,
        summary_date=date(2026, 3, 1),
        generated_content="Test",
        is_edited=False,
        image_urls=["summary_key.jpg"],
    )
    db.add(summary)
    db.commit()

    response = client.delete(f"/api/babies/{baby.id}/daily-summary/2026-03-01")
    assert response.status_code == 204
    mock_delete.assert_called_once_with(["summary_key.jpg"])


@patch("app.routers.ai_summary.delete_s3_objects")
def test_delete_daily_summary_no_images_skips_cleanup(mock_delete, auth_client, db):
    """画像なし（None）の AI 日誌削除では S3 クリーンアップを実行しない。"""
    client, baby = _setup(auth_client, db, "s3summary2")
    summary = DailySummary(
        baby_id=baby.id,
        summary_date=date(2026, 3, 2),
        generated_content="Test",
        is_edited=False,
        image_urls=None,
    )
    db.add(summary)
    db.commit()

    response = client.delete(f"/api/babies/{baby.id}/daily-summary/2026-03-02")
    assert response.status_code == 204
    mock_delete.assert_not_called()

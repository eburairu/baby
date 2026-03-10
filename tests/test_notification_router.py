import pytest
from app.models.notification import AppNotification

def test_mark_as_read_status_204(auth_client, db):
    """個別通知の既読化が 204 No Content を返すことを確認"""
    # テスト用通知の作成
    notification = AppNotification(
        user_id=1,  # auth_client のデフォルトユーザーID
        type="system",
        title="Test Notification",
        body="Test Body",
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    client = auth_client()
    response = client.patch(f"/api/notifications/{notification.id}/read")
    
    assert response.status_code == 204
    assert not response.content  # レスポンスボディが空であることを確認

    # DB側で既読になっているか確認
    db.refresh(notification)
    assert notification.is_read is True

def test_mark_all_as_read_status_204(auth_client, db):
    """全通知の一括既読化が 204 No Content を返すことを確認"""
    # テスト用通知の作成
    notifications = [
        AppNotification(user_id=1, type="system", title=f"Test {i}", is_read=False)
        for i in range(3)
    ]
    for n in notifications:
        db.add(n)
    db.commit()

    client = auth_client()
    response = client.patch("/api/notifications/read-all")
    
    assert response.status_code == 204
    assert not response.content

    # 全て既読になっているか確認
    for n in notifications:
        db.refresh(n)
        assert n.is_read is True

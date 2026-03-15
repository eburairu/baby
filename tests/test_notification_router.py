import pytest
from app.models.notification import AppNotification

def test_mark_as_read_status_204(auth_client, db):
    """個別通知の既読化が 204 No Content を返すことを確認"""
    client = auth_client()

    # ログイン済みユーザーのIDを取得
    me = client.get("/api/auth/me")
    user_id = me.json()["id"]

    notification = AppNotification(
        user_id=user_id,
        type="system",
        title="Test Notification",
        body="Test Body",
        is_read=False
    )
    db.add(notification)
    db.flush()
    db.refresh(notification)

    response = client.patch(f"/api/notifications/{notification.id}/read")

    assert response.status_code == 204
    assert not response.content

    db.refresh(notification)
    assert notification.is_read is True

def test_mark_all_as_read_status_204(auth_client, db):
    """全通知の一括既読化が 204 No Content を返すことを確認"""
    client = auth_client()

    # ログイン済みユーザーのIDを取得
    me = client.get("/api/auth/me")
    user_id = me.json()["id"]

    notifications = [
        AppNotification(user_id=user_id, type="system", title=f"Test {i}", is_read=False)
        for i in range(3)
    ]
    for n in notifications:
        db.add(n)
    db.flush()

    response = client.patch("/api/notifications/read-all")

    assert response.status_code == 204
    assert not response.content

    for n in notifications:
        db.refresh(n)
        assert n.is_read is True

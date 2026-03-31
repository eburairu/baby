import pytest
from app.models.family import UserRole


def test_comment_on_temperature_record(auth_client, db):
    """体温記録に対してコメントの取得・投稿ができること（#1225）"""
    client = auth_client()

    # 赤ちゃん作成
    res = client.post("/api/babies/", json={"name": "Baby Temp"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # 体温記録作成
    res = client.post("/api/temperatures/", json={
        "baby_id": baby_id,
        "measured_at": "2024-03-20T10:00:00Z",
        "temperature": 36.5,
        "method": "AXILLARY",
    })
    assert res.status_code == 200
    record_id = res.json()["id"]

    # コメント投稿 → 400 ではなく 200 であること
    res = client.post(f"/api/records/temperature/{record_id}/comments", json={"content": "正常な体温です"})
    assert res.status_code == 200
    assert res.json()["content"] == "正常な体温です"

    # コメント取得 → 400 ではなく 200 であること
    res = client.get(f"/api/records/temperature/{record_id}/comments")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["content"] == "正常な体温です"

def test_viewer_can_comment(client, auth_client, db):
    # 1. Admin が家族を作成
    admin_client = auth_client(username="admin_user", family_name="Happy Family")
    
    # 赤ちゃんを登録
    res = admin_client.post("/api/babies/", json={"name": "Baby A"})
    baby_id = res.json()["id"]
    
    # 授乳記録を作成
    res = admin_client.post(f"/api/babies/{baby_id}/records", json={
        "type": "feeding",
        "timestamp": "2024-03-20T10:00:00Z"
    })
    record_id = res.json()["id"]
    
    # 招待コード取得
    res = admin_client.get("/api/family/")
    invite_code = res.json()["invite_code"]
    
    # 2. Viewer が参加
    viewer_client = client # new client instance
    res = viewer_client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "viewer_user",
        "password": "viewerpassword123"
    })
    assert res.status_code == 200
    viewer_id = res.json()["id"]

    # ADMINとして戻り、VIEWERに赤ちゃん + 授乳の閲覧権限を付与（デフォルト拒否のため）
    admin_client.post("/api/auth/login", json={"username": "admin_user", "password": "testpassword123"})
    admin_client.put(f"/api/babies/{baby_id}/permissions", json={
        "permissions": [
            {"user_id": viewer_id, "record_type": "baby", "can_view": True},
            {"user_id": viewer_id, "record_type": "feeding", "can_view": True},
        ]
    })

    # 再度VIEWERとしてログイン
    viewer_client.post("/api/auth/login", json={
        "username": "viewer_user",
        "password": "viewerpassword123"
    })

    # 3. Viewer がコメントを投稿
    res = viewer_client.post(f"/api/records/feeding/{record_id}/comments", json={
        "content": "Well done, Baby A!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["content"] == "Well done, Baby A!"
    assert data["user_role"] == UserRole.VIEWER
    
    # 4. コメントを取得
    res = viewer_client.get(f"/api/records/feeding/{record_id}/comments")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["content"] == "Well done, Baby A!"

def test_comment_deleted_with_record(auth_client, db):
    client = auth_client()
    
    # 赤ちゃんを登録
    res = client.post("/api/babies/", json={"name": "Baby B"})
    baby_id = res.json()["id"]
    
    # 授乳記録を作成
    res = client.post(f"/api/babies/{baby_id}/records", json={
        "type": "feeding",
        "timestamp": "2024-03-20T10:00:00Z"
    })
    record_id = res.json()["id"]
    
    # コメント投稿
    client.post(f"/api/records/feeding/{record_id}/comments", json={"content": "Comment 1"})
    
    # 記録を削除
    res = client.delete(f"/api/feedings/{record_id}")
    assert res.status_code == 200
    
    # コメントが消えていることを確認 (APIからは record not found になるはず)
    res = client.get(f"/api/records/feeding/{record_id}/comments")
    assert res.status_code == 404

def test_cannot_comment_on_other_family_record(auth_client, db):
    # Family A
    client_a = auth_client(username="user_a", family_name="Family A")
    res = client_a.post("/api/babies/", json={"name": "Baby A"})
    baby_a_id = res.json()["id"]
    res = client_a.post(f"/api/babies/{baby_a_id}/records", json={
        "type": "feeding",
        "timestamp": "2024-03-20T10:00:00Z"
    })
    record_a_id = res.json()["id"]
    
    # Family B
    # Create a new client to avoid shared cookies
    from fastapi.testclient import TestClient
    from app.main import app
    client_b = TestClient(app)
    res = client_b.post("/api/auth/register/family", json={
        "name": "Family B",
        "username": "user_b",
        "password": "passwordB123"
    })
    client_b.post("/api/auth/login", json={"username": "user_b", "password": "passwordB123"})
    
    # Family B user tries to comment on Family A's record
    res = client_b.post(f"/api/records/feeding/{record_a_id}/comments", json={"content": "Stealing a look!"})
    assert res.status_code == 403

def test_get_records_includes_comment_counts(auth_client, db):
    """
    Verify that GET /api/babies/{id}/records correctly returns comment counts.
    This ensures our optimization (fetching counts by ID list) works correctly.
    """
    client = auth_client()

    # 1. 赤ちゃん作成
    res = client.post("/api/babies/", json={"name": "Baby C"})
    baby_id = res.json()["id"]

    # 2. 授乳記録作成 (コメントあり)
    res = client.post(f"/api/babies/{baby_id}/records", json={
        "type": "feeding",
        "timestamp": "2024-03-20T10:00:00Z"
    })
    feeding_id = res.json()["id"]

    # コメント2つ追加
    client.post(f"/api/records/feeding/{feeding_id}/comments", json={"content": "C1"})
    client.post(f"/api/records/feeding/{feeding_id}/comments", json={"content": "C2"})

    # 3. 睡眠記録作成 (コメントなし)
    res = client.post(f"/api/babies/{baby_id}/records", json={
        "type": "sleep",
        "timestamp": "2024-03-20T12:00:00Z"
    })
    sleep_id = res.json()["id"]

    # 4. レコード取得
    res = client.get(f"/api/babies/{baby_id}/records")
    assert res.status_code == 200
    records = res.json()

    # 検証
    feeding_rec = next(r for r in records if r["type"] == "feeding" and r["id"] == feeding_id)
    sleep_rec = next(r for r in records if r["type"] == "sleep" and r["id"] == sleep_id)

    assert feeding_rec["comment_count"] == 2
    assert sleep_rec["comment_count"] == 0

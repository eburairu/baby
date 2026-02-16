import pytest
from app.models.family import UserRole

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
    
    # ログイン
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

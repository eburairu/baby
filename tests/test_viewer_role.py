import pytest
from app.models.family import UserRole

def test_viewer_default_on_join(client):
    # 1. ADMINが家族を作成
    client.post("/api/auth/register/family", json={
        "name": "Admin Family",
        "username": "admin_user",
        "password": "password123"
    })
    res = client.get("/api/family/")
    invite_code = res.json()["invite_code"]
    client.cookies.clear()

    # 2. 新規ユーザーが参加
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "viewer_user",
        "password": "password123"
    })
    assert res.status_code == 200
    assert res.json()["role"] == UserRole.VIEWER

    # 3. /me でロールを確認
    res = client.get("/api/auth/me")
    assert res.json()["role"] == UserRole.VIEWER

def test_viewer_read_only_access(client):
    # 1. ADMINが家族を作成し、赤ちゃんを登録
    client.post("/api/auth/register/family", json={
        "name": "Test Family",
        "username": "admin_user",
        "password": "password123"
    })
    res = client.post("/api/babies/", json={"name": "Baby", "gender": "boy"})
    baby_id = res.json()["id"]
    invite_code = client.get("/api/family/").json()["invite_code"]
    client.cookies.clear()

    # 2. VIEWERが参加
    client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "viewer_user",
        "password": "password123"
    })

    # 3. 閲覧は可能
    res = client.get(f"/api/feedings/?baby_id={baby_id}")
    assert res.status_code == 200

    # 4. 作成は拒否 (403)
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE"
    })
    assert res.status_code == 403
    assert "Read-only users cannot perform this action" in res.json()["detail"]

    # 5. 削除も拒否 (403)
    # まずADMINとして記録作成
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "admin_user", "password": "password123"})
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE"
    })
    feeding_id = res.json()["id"]
    client.cookies.clear()

    # 再度VIEWERとしてログイン
    client.post("/api/auth/login", json={"username": "viewer_user", "password": "password123"})
    res = client.delete(f"/api/feedings/{feeding_id}")
    assert res.status_code == 403

def test_admin_can_change_role(client):
    # 1. ADMINが家族を作成
    client.post("/api/auth/register/family", json={
        "name": "Role Family",
        "username": "admin_user",
        "password": "password123"
    })
    invite_code = client.get("/api/family/").json()["invite_code"]
    client.cookies.clear()

    # 2. ユーザーが参加 (最初はVIEWER)
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "target_user",
        "password": "password123"
    })
    user_id = res.json()["id"]
    client.cookies.clear()

    # 3. ADMINがロールをMEMBERに変更
    client.post("/api/auth/login", json={"username": "admin_user", "password": "password123"})
    res = client.patch(f"/api/family/members/{user_id}/role", json={"role": UserRole.MEMBER})
    assert res.status_code == 200
    assert res.json()["role"] == UserRole.MEMBER

    # 4. MEMBERなら作成できることを確認
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "target_user", "password": "password123"})
    res = client.post("/api/babies/", json={"name": "Another Baby", "gender": "girl"})
    # MEMBERは赤ちゃん作成権限はない(ADMINのみ)が、ここでは権限不足で403になるはず
    # 代わりに授乳記録などでテスト
    res = client.post("/api/babies/", json={"name": "Baby", "gender": "boy"}) # This will fail for MEMBER
    assert res.status_code == 403 
    
    # 授乳記録ならMEMBERもOKなはず
    # まずADMINとして赤ちゃん作成
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "admin_user", "password": "password123"})
    res = client.post("/api/babies/", json={"name": "Real Baby", "gender": "boy"})
    baby_id = res.json()["id"]
    client.cookies.clear()
    
    # MEMBERとしてログイン
    client.post("/api/auth/login", json={"username": "target_user", "password": "password123"})
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE"
    })
    assert res.status_code == 200

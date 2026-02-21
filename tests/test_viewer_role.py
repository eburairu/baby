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
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "viewer_user",
        "password": "password123"
    })
    viewer_id = res.json()["id"]

    # 3. ADMINとして戻り、VIEWERに赤ちゃん + 授乳の閲覧権限を付与（デフォルト拒否のため）
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "admin_user", "password": "password123"})
    client.put(f"/api/babies/{baby_id}/permissions", json={
        "permissions": [
            {"user_id": viewer_id, "record_type": "baby", "can_view": True},
            {"user_id": viewer_id, "record_type": "feeding", "can_view": True},
        ]
    })
    client.cookies.clear()

    # 4. VIEWERとしてログイン
    res = client.post("/api/auth/login", json={"username": "viewer_user", "password": "password123"})
    print(f"Viewer login status: {res.status_code}")
    print(f"Viewer login response: {res.text}")

    # 5. 閲覧は可能
    res = client.get(f"/api/feedings/?baby_id={baby_id}")
    assert res.status_code == 200

    # 6. 作成は拒否 (403)
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE"
    })
    assert res.status_code == 403
    assert "Read-only users cannot perform this action" in res.json()["detail"]

    # 7. 削除も拒否 (403)
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
    res = client.post("/api/auth/login", json={"username": "viewer_user", "password": "password123"})
    print(f"Viewer re-login status: {res.status_code}")
    print(f"Viewer re-login response: {res.text}")

    res = client.delete(f"/api/feedings/{feeding_id}")
    print(f"Delete status: {res.status_code}")
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

    # MEMBERに赤ちゃん + 授乳の閲覧権限を付与（デフォルト拒否のため）
    client.put(f"/api/babies/{baby_id}/permissions", json={
        "permissions": [
            {"user_id": user_id, "record_type": "baby", "can_view": True},
            {"user_id": user_id, "record_type": "feeding", "can_view": True},
        ]
    })
    client.cookies.clear()

    # MEMBERとしてログイン
    client.post("/api/auth/login", json={"username": "target_user", "password": "password123"})
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE"
    })
    assert res.status_code == 200


def test_member_can_write_without_baby_permission(client):
    """
    MEMBERはBabyPermission未設定でも記録を書き込めることを確認する。
    （不具合修正: BabyPermissionのcan_viewチェックが書き込み操作にも適用されていた問題）
    """
    # 1. ADMINが家族を作成
    client.post("/api/auth/register/family", json={
        "name": "Perm Test Family",
        "username": "perm_admin",
        "password": "password123"
    })
    invite_code = client.get("/api/family/").json()["invite_code"]
    res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "girl"})
    baby_id = res.json()["id"]

    # 2. ユーザーが参加 (最初はVIEWER)
    client.cookies.clear()
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "perm_member",
        "password": "password123"
    })
    member_id = res.json()["id"]

    # 3. ADMINがロールをMEMBERに変更（BabyPermissionは設定しない）
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "perm_admin", "password": "password123"})
    res = client.patch(f"/api/family/members/{member_id}/role", json={"role": UserRole.MEMBER})
    assert res.status_code == 200
    assert res.json()["role"] == UserRole.MEMBER
    # BabyPermissionは設定しない（デフォルト拒否のまま）

    # 4. MEMBERとしてログインし、BabyPermission未設定でも記録を作成できることを確認
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "perm_member", "password": "password123"})
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE"
    })
    # BabyPermission未設定でもMEMBERは書き込みできるべき
    assert res.status_code == 200, f"MEMBER should be able to write without BabyPermission, got: {res.status_code} {res.text}"

    # 5. VIEWERはBabyPermission設定があっても書き込みが拒否されることを確認
    # (念のため: 既存のVIEWER拒否ロジックが壊れていないことの確認)
    client.cookies.clear()
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "perm_viewer",
        "password": "password123"
    })
    viewer_id = res.json()["id"]
    # ADMINとしてVIEWERに閲覧権限を付与
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "perm_admin", "password": "password123"})
    client.put(f"/api/babies/{baby_id}/permissions", json={
        "permissions": [
            {"user_id": viewer_id, "record_type": "baby", "can_view": True},
            {"user_id": viewer_id, "record_type": "feeding", "can_view": True},
        ]
    })
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": "perm_viewer", "password": "password123"})
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T11:00:00",
        "feeding_type": "BOTTLE"
    })
    # VIEWERはBabyPermission設定があっても書き込みは拒否
    assert res.status_code == 403, f"VIEWER should be rejected even with BabyPermission, got: {res.status_code}"
    assert "Read-only users cannot perform this action" in res.json()["detail"]

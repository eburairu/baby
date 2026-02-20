import pytest
from app.models.family import UserRole

def test_change_own_password(client):
    # 1. ユーザー登録
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Tanaka Family",
            "username": "tanaka",
            "password": "oldPassword123"
        }
    )
    
    # 2. パスワード変更
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "oldPassword123",
            "new_password": "newPassword123"
        }
    )
    assert response.status_code == 204
    
    # 3. 旧パスワードでログイン試行 (失敗)
    client.cookies.clear()
    login_fail = client.post(
        "/api/auth/login",
        json={
            "username": "tanaka",
            "password": "oldPassword123"
        }
    )
    assert login_fail.status_code == 401
    
    # 4. 新パスワードでログイン試行 (成功)
    login_success = client.post(
        "/api/auth/login",
        json={
            "username": "tanaka",
            "password": "newPassword123"
        }
    )
    assert login_success.status_code == 200

def test_admin_resets_member_password(client):
    # 1. Admin登録
    res_admin = client.post(
        "/api/auth/register/family",
        json={
            "name": "Admin Family",
            "username": "admin",
            "password": "adminPassword123"
        }
    )
    invite_code = res_admin.json()["invite_code"]
    
    # 2. Member登録 (招待)
    client.cookies.clear()
    client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={
            "username": "member",
            "password": "memberPassword123"
        }
    )
    res_me = client.get("/api/auth/me")
    member_id = res_me.json()["id"]
    client.cookies.clear()
    
    # 3. Adminでログイン
    client.post(
        "/api/auth/login",
        json={
            "username": "admin",
            "password": "adminPassword123"
        }
    )
    
    # 4. AdminがMemberのパスワードをリセット
    res_reset = client.post(f"/api/family/members/{member_id}/reset-password")
    assert res_reset.status_code == 200
    temp_password = res_reset.json()["temporary_password"]
    assert len(temp_password) >= 12
    
    # 5. Memberが旧パスワードでログイン試行 (失敗)
    client.cookies.clear()
    login_fail = client.post(
        "/api/auth/login",
        json={
            "username": "member",
            "password": "memberPassword123"
        }
    )
    assert login_fail.status_code == 401
    
    # 6. Memberが仮パスワードでログイン試行 (成功)
    login_success = client.post(
        "/api/auth/login",
        json={
            "username": "member",
            "password": temp_password
        }
    )
    assert login_success.status_code == 200

def test_change_password_invalidates_other_sessions(client):
    # 1. ユーザー登録
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Session Family",
            "username": "session_user",
            "password": "oldPassword123"
        }
    )
    token1 = client.cookies.get("access_token")
    
    # 2. 別のセッションを作成
    client.cookies.clear()
    client.post(
        "/api/auth/login",
        json={
            "username": "session_user",
            "password": "oldPassword123"
        }
    )
    token2 = client.cookies.get("access_token")
    assert token1 != token2
    
    # 3. セッション2でパスワード変更
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "oldPassword123",
            "new_password": "newPassword123"
        }
    )
    assert response.status_code == 204
    
    # 4. セッション1が使えなくなっていることを確認 (401)
    client.cookies.clear()
    client.cookies.set("access_token", token1)
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 401
    
    # 5. セッション2はまだ使えることを確認 (200)
    client.cookies.clear()
    client.cookies.set("access_token", token2)
    res_me_ok = client.get("/api/auth/me")
    assert res_me_ok.status_code == 200

def test_admin_reset_invalidates_all_member_sessions(client):
    # 1. Admin登録
    res_admin = client.post(
        "/api/auth/register/family",
        json={
            "name": "Admin Family",
            "username": "admin",
            "password": "adminPassword123"
        }
    )
    invite_code = res_admin.json()["invite_code"]
    
    # 2. Member登録
    client.cookies.clear()
    client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={
            "username": "member",
            "password": "memberPassword123"
        }
    )
    token_member = client.cookies.get("access_token")
    res_me = client.get("/api/auth/me")
    member_id = res_me.json()["id"]
    
    # 3. Adminでログインしてリセット
    client.cookies.clear()
    client.post(
        "/api/auth/login",
        json={
            "username": "admin",
            "password": "adminPassword123"
        }
    )
    client.post(f"/api/family/members/{member_id}/reset-password")
    
    # 4. Memberの旧セッションが使えなくなっていることを確認
    client.cookies.clear()
    client.cookies.set("access_token", token_member)
    res_me_fail = client.get("/api/auth/me")
    assert res_me_fail.status_code == 401

def test_member_cannot_reset_admin_password(client):
    # 1. Admin登録
    res_admin = client.post(
        "/api/auth/register/family",
        json={
            "name": "Admin Family",
            "username": "admin",
            "password": "adminPassword123"
        }
    )
    admin_id = res_admin.json()["id"] # wait, register/family returns FamilyResponse not UserResponse
    # FamilyResponse has no id for user.
    
    # Re-getting admin_id
    res_me_admin = client.get("/api/auth/me")
    admin_id = res_me_admin.json()["id"]
    invite_code = res_admin.json()["invite_code"]
    
    # 2. Member登録
    client.cookies.clear()
    client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={
            "username": "member",
            "password": "memberPassword123"
        }
    )
    
    # 3. Member (VIEWER/MEMBER) が Admin のパスワードリセットを試行 (失敗)
    res_reset = client.post(f"/api/family/members/{admin_id}/reset-password")
    assert res_reset.status_code == 403

def test_admin_cannot_reset_own_password_via_reset_endpoint(auth_client):
    client = auth_client(username="admin", password="adminPassword123")
    res_me = client.get("/api/auth/me")
    admin_id = res_me.json()["id"]
    
    # 自分自身のパスワードリセットを試行 (失敗)
    res_reset = client.post(f"/api/family/members/{admin_id}/reset-password")
    assert res_reset.status_code == 400
    assert res_reset.json()["detail"] == "Cannot reset your own password here"

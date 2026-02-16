import pytest
from app.models.family import UserRole

def test_update_role_with_invalid_value(client):
    # 1. ADMINが家族を作成
    client.post("/api/auth/register/family", json={
        "name": "Role Family",
        "username": "admin_user",
        "password": "password123"
    })
    res = client.get("/api/family/")
    invite_code = res.json()["invite_code"]
    client.cookies.clear()

    # 2. ユーザーが参加
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "target_user",
        "password": "password123"
    })
    user_id = res.json()["id"]
    client.cookies.clear()

    # 3. ADMINがログイン
    client.post("/api/auth/login", json={"username": "admin_user", "password": "password123"})

    # 4. 無効なロールで更新を試みる
    res = client.patch(f"/api/family/members/{user_id}/role", json={"role": "invalid_role"})
    assert res.status_code == 422
    # 現在はルーターで 422 が返るが、将来は Pydantic で返る

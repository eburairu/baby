"""
Issue #1036: 家族内の最後のADMIN権限降格・退会によるオーファン化防止のテスト

既存の実装に対して以下のエッジケースを網羅する:
- 最後のADMINをMEMBERに降格 → 400
- 最後のADMINをVIEWERに降格 → 400
- 最後のADMINを削除 → 400
- 2人のADMINがいる場合、1人のADMINを降格 → 200 (許可)
- 2人のADMINがいる場合、1人のADMINが自己削除 → 204 (許可)
"""
import pytest
from app.models.family import UserRole


def _register_family(client, username, family_name="Test Family"):
    client.cookies.clear()
    res = client.post("/api/auth/register/family", json={
        "name": family_name,
        "username": username,
        "password": "password123",
    })
    assert res.status_code == 200, f"register/family failed: {res.json()}"


def _register_join(client, username, invite_code):
    client.cookies.clear()
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": username,
        "password": "password123",
    })
    assert res.status_code == 200, f"register/join failed: {res.json()}"
    return res.json()["id"]


def _login(client, username):
    client.cookies.clear()
    res = client.post("/api/auth/login", json={"username": username, "password": "password123"})
    assert res.status_code == 200


def _get_my_id(client):
    return client.get("/api/auth/me").json()["id"]


def _get_invite_code(client):
    return client.get("/api/family/").json()["invite_code"]


def _promote_to_admin(client, user_id):
    res = client.patch(f"/api/family/members/{user_id}/role", json={"role": UserRole.ADMIN})
    assert res.status_code == 200, f"promote failed: {res.json()}"


# ---------------------------------------------------------------------------
# 1. 最後のADMINをMEMBERに降格しようとすると400
# ---------------------------------------------------------------------------
def test_last_admin_demotion_to_member_rejected(client):
    _register_family(client, "admin1036a")
    admin_id = _get_my_id(client)

    res = client.patch(f"/api/family/members/{admin_id}/role", json={"role": UserRole.MEMBER})
    assert res.status_code == 400
    assert "At least one admin is required" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 2. 最後のADMINをVIEWERに降格しようとすると400
# ---------------------------------------------------------------------------
def test_last_admin_demotion_to_viewer_rejected(client):
    _register_family(client, "admin1036b")
    admin_id = _get_my_id(client)

    res = client.patch(f"/api/family/members/{admin_id}/role", json={"role": UserRole.VIEWER})
    assert res.status_code == 400
    assert "At least one admin is required" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 3. 最後のADMINを他のADMINが削除しようとすると400（自身が唯一のADMIN）
# ---------------------------------------------------------------------------
def test_last_admin_deletion_rejected(client):
    _register_family(client, "admin1036c")
    invite_code = _get_invite_code(client)
    admin_id = _get_my_id(client)

    # MEMBERが参加（ADMIN ではない）
    member_id = _register_join(client, "member1036c", invite_code)

    _login(client, "admin1036c")
    res = client.delete(f"/api/family/members/{admin_id}")
    assert res.status_code == 400
    assert "At least one admin is required" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 4. ADMINが2人いる場合、1人をMEMBERに降格できる（ポジティブケース）
# ---------------------------------------------------------------------------
def test_admin_demotion_allowed_when_another_admin_exists(client):
    _register_family(client, "admin1036d")
    invite_code = _get_invite_code(client)
    admin1_id = _get_my_id(client)

    # 2人目が参加してADMINに昇格
    admin2_id = _register_join(client, "admin2_1036d", invite_code)
    _login(client, "admin1036d")
    _promote_to_admin(client, admin2_id)

    # admin1がadmin2をMEMBERに降格 → 許可されるべき
    res = client.patch(f"/api/family/members/{admin2_id}/role", json={"role": UserRole.MEMBER})
    assert res.status_code == 200
    assert res.json()["role"] == UserRole.MEMBER


# ---------------------------------------------------------------------------
# 5. ADMINが2人いる場合、1人が自己削除できる（ポジティブケース）
# ---------------------------------------------------------------------------
def test_admin_self_delete_allowed_when_another_admin_exists(client):
    _register_family(client, "admin1036e")
    invite_code = _get_invite_code(client)
    admin1_id = _get_my_id(client)

    # 2人目が参加してADMINに昇格
    admin2_id = _register_join(client, "admin2_1036e", invite_code)
    _login(client, "admin1036e")
    _promote_to_admin(client, admin2_id)

    # admin1が自分自身を削除 → 許可されるべき（admin2が残るため）
    res = client.delete(f"/api/family/members/{admin1_id}")
    assert res.status_code == 204

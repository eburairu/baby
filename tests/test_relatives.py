import pytest
from fastapi.testclient import TestClient


def _create_baby(client: TestClient, name: str = "テスト赤ちゃん") -> int:
    res = client.post("/api/babies/", json={"name": name, "gender": "boy"})
    assert res.status_code == 200
    return res.json()["id"]


def test_get_relatives_unauthorized(client: TestClient):
    response = client.get("/api/babies/1/relatives")
    assert response.status_code == 401


def test_create_relative(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    resp = client.post(
        f"/api/babies/{baby_id}/relatives",
        json={"name": "田中太郎", "relationship_type": "father"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "田中太郎"
    assert data["relationship_type"] == "father"
    assert data["user_id"] is None
    assert data["notes"] is None
    assert "id" in data


def test_create_relative_with_notes(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    resp = client.post(
        f"/api/babies/{baby_id}/relatives",
        json={
            "name": "田中花子",
            "relationship_type": "mother",
            "notes": "育児を頑張っています",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["notes"] == "育児を頑張っています"


def test_create_relative_all_relationship_types(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    valid_types = [
        "father", "mother",
        "paternal_grandfather", "paternal_grandmother",
        "maternal_grandfather", "maternal_grandmother",
        "paternal_uncle", "paternal_aunt",
        "maternal_uncle", "maternal_aunt",
        "older_brother", "older_sister",
        "younger_brother", "younger_sister",
    ]
    for rt in valid_types:
        resp = client.post(
            f"/api/babies/{baby_id}/relatives",
            json={"name": f"テスト {rt}", "relationship_type": rt},
        )
        assert resp.status_code == 200, f"relationship_type={rt} failed: {resp.text}"


def test_create_relative_invalid_type(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    resp = client.post(
        f"/api/babies/{baby_id}/relatives",
        json={"name": "テスト", "relationship_type": "alien"},
    )
    assert resp.status_code == 422


def test_get_relatives_list(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    client.post(f"/api/babies/{baby_id}/relatives", json={"name": "父", "relationship_type": "father"})
    client.post(f"/api/babies/{baby_id}/relatives", json={"name": "母", "relationship_type": "mother"})

    resp = client.get(f"/api/babies/{baby_id}/relatives")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    types = {r["relationship_type"] for r in data}
    assert "father" in types
    assert "mother" in types


def test_update_relative(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    create_resp = client.post(
        f"/api/babies/{baby_id}/relatives",
        json={"name": "祖父", "relationship_type": "paternal_grandfather"},
    )
    relative_id = create_resp.json()["id"]

    resp = client.patch(
        f"/api/babies/{baby_id}/relatives/{relative_id}",
        json={"name": "田中一郎", "notes": "元気なおじいちゃん"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "田中一郎"
    assert data["notes"] == "元気なおじいちゃん"
    assert data["relationship_type"] == "paternal_grandfather"


def test_delete_relative(client: TestClient, auth_client):
    client = auth_client()
    baby_id = _create_baby(client)

    create_resp = client.post(
        f"/api/babies/{baby_id}/relatives",
        json={"name": "叔父", "relationship_type": "paternal_uncle"},
    )
    relative_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/babies/{baby_id}/relatives/{relative_id}")
    assert del_resp.status_code == 200

    # 削除後は一覧に出ない
    list_resp = client.get(f"/api/babies/{baby_id}/relatives")
    assert all(r["id"] != relative_id for r in list_resp.json())


def test_link_relative_to_user(client: TestClient, auth_client):
    """親戚をアプリユーザーに紐付けできること"""
    client = auth_client()
    baby_id = _create_baby(client)

    # 自分自身のユーザーIDを取得
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 200
    user_id = me_resp.json()["id"]

    resp = client.post(
        f"/api/babies/{baby_id}/relatives",
        json={"name": "パパ", "relationship_type": "father", "user_id": user_id},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["user_display_name"] is not None


def test_create_relative_wrong_baby(client: TestClient, auth_client):
    """別の家族の赤ちゃんには追加できないこと"""
    client = auth_client()

    resp = client.post(
        "/api/babies/99999/relatives",
        json={"name": "父", "relationship_type": "father"},
    )
    assert resp.status_code == 403


def test_multiple_siblings(client: TestClient, auth_client):
    """兄弟姉妹は複数登録できること"""
    client = auth_client()
    baby_id = _create_baby(client)

    client.post(f"/api/babies/{baby_id}/relatives", json={"name": "長男", "relationship_type": "older_brother"})
    client.post(f"/api/babies/{baby_id}/relatives", json={"name": "次男", "relationship_type": "older_brother"})

    resp = client.get(f"/api/babies/{baby_id}/relatives")
    siblings = [r for r in resp.json() if r["relationship_type"] == "older_brother"]
    assert len(siblings) == 2

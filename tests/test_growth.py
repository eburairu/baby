import pytest
from fastapi.testclient import TestClient
from datetime import date
from app.models.growth import Growth
from app.models.baby import Baby

def test_get_growths_unauthenticated(client: TestClient):
    response = client.get("/api/growths/?baby_id=1")
    assert response.status_code == 401

def test_get_growths_missing_baby_id(client: TestClient, auth_client):
    client = auth_client()
    response = client.get("/api/growths/")
    assert response.status_code == 422

def test_create_growth_success(client: TestClient, auth_client):
    client = auth_client()
    # 赤ちゃんを作成
    baby_res = client.post("/api/babies/", json={"name": "成長テスト", "gender": "girl"})
    baby_id = baby_res.json()["id"]

    payload = {
        "baby_id": baby_id,
        "date": date.today().isoformat(),
        "weight": 3500,
        "height": 51.5,
        "head_circumference": 34.0,
        "notes": "順調です"
    }
    response = client.post("/api/growths/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["weight"] == 3500
    assert data["height"] == 51.5
    assert data["recorded_by_display_name"] == "testuser"

def test_get_growths_list(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "リストテスト", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    # 2件作成
    for i in range(2):
        client.post("/api/growths/", json={
            "baby_id": baby_id,
            "date": date.today().isoformat(),
            "weight": 3000 + i,
            "height": 50.0 + i
        })

    response = client.get(f"/api/growths/?baby_id={baby_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_update_growth(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "更新テスト", "gender": "girl"})
    baby_id = baby_res.json()["id"]

    # 作成
    create_res = client.post("/api/growths/", json={
        "baby_id": baby_id,
        "date": date.today().isoformat(),
        "weight": 4000
    })
    growth_id = create_res.json()["id"]

    # 更新
    update_payload = {"weight": 4100, "notes": "修正しました"}
    response = client.put(f"/api/growths/{growth_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["weight"] == 4100
    assert response.json()["notes"] == "修正しました"

def test_delete_growth(client: TestClient, auth_client, db):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "削除テスト", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    # 作成
    create_res = client.post("/api/growths/", json={
        "baby_id": baby_id,
        "date": date.today().isoformat(),
        "weight": 5000
    })
    growth_id = create_res.json()["id"]

    # 削除
    response = client.delete(f"/api/growths/{growth_id}")
    assert response.status_code == 200
    
    # DB確認
    record = db.query(Growth).filter(Growth.id == growth_id).execution_options(include_deleted=True).first()
    assert record is not None
    assert record.is_deleted is True

def test_access_other_family_baby(client: TestClient, auth_client):
    # 家族Aのユーザーで赤ちゃんAを作成
    client_a = auth_client(username="user_a", family_name="Family A")
    baby_a_res = client_a.post("/api/babies/", json={"name": "Baby A", "gender": "boy"})
    baby_a_id = baby_a_res.json()["id"]

    # 家族Bのユーザーでログイン
    client_b = auth_client(username="user_b", family_name="Family B")

    # 家族Bが赤ちゃんAのデータを取得しようとする -> 403
    response = client_b.get(f"/api/growths/?baby_id={baby_a_id}")
    assert response.status_code == 403

    # 家族Bが赤ちゃんAに記録しようとする -> 403
    response = client_b.post("/api/growths/", json={
        "baby_id": baby_a_id,
        "date": date.today().isoformat(),
        "weight": 3000
    })
    assert response.status_code == 403

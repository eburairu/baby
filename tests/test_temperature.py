import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from app.models.temperature import TemperatureRecord


def test_get_temperatures_unauthorized(client: TestClient):
    response = client.get("/api/temperatures/?baby_id=1")
    assert response.status_code == 401


def test_get_temperatures_missing_baby_id(client: TestClient, auth_client):
    client = auth_client()
    response = client.get("/api/temperatures/")
    assert response.status_code == 422


def test_create_temperature(client: TestClient, auth_client):
    client = auth_client()

    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    assert baby_res.status_code == 200
    baby_id = baby_res.json()["id"]

    # 基本的な体温記録（わきの下）
    resp = client.post(
        "/api/temperatures/",
        json={
            "baby_id": baby_id,
            "measured_at": datetime.now(timezone.utc).isoformat(),
            "temperature": 37.2,
            "method": "AXILLARY",
            "notes": "測定メモ",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["temperature"] == 37.2
    assert data["method"] == "AXILLARY"
    assert data["notes"] == "測定メモ"
    assert "id" in data
    assert "recorded_by_display_name" in data
    assert "comment_count" in data


def test_create_temperature_all_methods(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    for method in ["AXILLARY", "EAR", "FOREHEAD", "RECTAL"]:
        resp = client.post(
            "/api/temperatures/",
            json={
                "baby_id": baby_id,
                "measured_at": datetime.now(timezone.utc).isoformat(),
                "temperature": 36.5,
                "method": method,
            },
        )
        assert resp.status_code == 200, f"method={method} failed"
        assert resp.json()["method"] == method


def test_create_temperature_default_method(client: TestClient, auth_client):
    """method 省略時はデフォルトで AXILLARY になること"""
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    resp = client.post(
        "/api/temperatures/",
        json={
            "baby_id": baby_id,
            "measured_at": datetime.now(timezone.utc).isoformat(),
            "temperature": 36.8,
        },
    )
    assert resp.status_code == 200
    assert resp.json()["method"] == "AXILLARY"


def test_get_temperatures_list(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    # 2件作成
    for temp in [37.0, 38.2]:
        client.post(
            "/api/temperatures/",
            json={
                "baby_id": baby_id,
                "measured_at": datetime.now(timezone.utc).isoformat(),
                "temperature": temp,
            },
        )

    response = client.get(f"/api/temperatures/?baby_id={baby_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert "recorded_by_display_name" in data[0]
    assert "comment_count" in data[0]
    # 降順（新しい順）であること
    assert data[0]["temperature"] == 38.2
    assert data[1]["temperature"] == 37.0


def test_update_temperature(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    resp = client.post(
        "/api/temperatures/",
        json={
            "baby_id": baby_id,
            "measured_at": datetime.now(timezone.utc).isoformat(),
            "temperature": 37.0,
            "method": "AXILLARY",
        },
    )
    record_id = resp.json()["id"]

    # 更新
    response = client.put(
        f"/api/temperatures/{record_id}",
        json={
            "temperature": 38.5,
            "method": "EAR",
            "notes": "更新後のメモ",
        },
    )
    assert response.status_code == 200
    assert response.json()["temperature"] == 38.5
    assert response.json()["method"] == "EAR"
    assert response.json()["notes"] == "更新後のメモ"


def test_delete_temperature(client: TestClient, auth_client, db):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    resp = client.post(
        "/api/temperatures/",
        json={
            "baby_id": baby_id,
            "measured_at": datetime.now(timezone.utc).isoformat(),
            "temperature": 36.9,
        },
    )
    record_id = resp.json()["id"]

    response = client.delete(f"/api/temperatures/{record_id}")
    assert response.status_code == 200
    record = db.query(TemperatureRecord).filter(TemperatureRecord.id == record_id).execution_options(include_deleted=True).first()
    assert record is not None
    assert record.is_deleted is True


def test_temperature_access_control(client: TestClient, auth_client):
    client1 = auth_client(username="user1", family_name="Family1")
    baby_res = client1.post("/api/babies/", json={"name": "赤ちゃん1", "gender": "girl"})
    baby_id = baby_res.json()["id"]

    temp_res = client1.post(
        "/api/temperatures/",
        json={
            "baby_id": baby_id,
            "measured_at": datetime.now(timezone.utc).isoformat(),
            "temperature": 37.0,
        },
    )
    record_id = temp_res.json()["id"]

    client2 = auth_client(username="user2", family_name="Family2")

    # 他の家族の一覧取得 → 403
    assert client2.get(f"/api/temperatures/?baby_id={baby_id}").status_code == 403
    # 他の家族の記録を更新 → 403
    assert client2.put(f"/api/temperatures/{record_id}", json={"notes": "不正"}).status_code == 403
    # 他の家族の記録を削除 → 403
    assert client2.delete(f"/api/temperatures/{record_id}").status_code == 403


def test_temperature_invalid_range(client: TestClient, auth_client):
    """34.0〜42.0°C の範囲外はバリデーションエラー"""
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    for temp in [33.9, 42.1]:
        resp = client.post(
            "/api/temperatures/",
            json={
                "baby_id": baby_id,
                "measured_at": datetime.now(timezone.utc).isoformat(),
                "temperature": temp,
            },
        )
        assert resp.status_code == 422, f"temperature={temp} should be rejected"

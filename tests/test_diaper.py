import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.models.diaper import Diaper
from app.models.baby import Baby

def test_get_diapers_unauthorized(client: TestClient):
    response = client.get("/api/diapers/?baby_id=1")
    assert response.status_code == 401

def test_get_diapers_missing_baby_id(client: TestClient, auth_client):
    client = auth_client()
    response = client.get("/api/diapers/")
    assert response.status_code == 422

def test_create_diaper(client: TestClient, auth_client):
    client = auth_client()
    
    # 赤ちゃんを登録
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    assert baby_res.status_code == 200
    baby_id = baby_res.json()["id"]

    # WET (おしっこ) の作成
    resp_wet = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now().isoformat(),
            "diaper_type": "WET",
            "notes": "おしっこ多め"
        }
    )
    assert resp_wet.status_code == 200
    assert resp_wet.json()["diaper_type"] == "WET"
    assert resp_wet.json()["notes"] == "おしっこ多め"

    # DIRTY (うんち) の作成
    resp_dirty = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now().isoformat(),
            "diaper_type": "DIRTY"
        }
    )
    assert resp_dirty.status_code == 200
    assert resp_dirty.json()["diaper_type"] == "DIRTY"

    # BOTH (両方) の作成
    resp_both = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now().isoformat(),
            "diaper_type": "BOTH"
        }
    )
    assert resp_both.status_code == 200
    assert resp_both.json()["diaper_type"] == "BOTH"

def test_get_diapers_list(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    # 記録を1つ作成
    client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": (datetime.now() - timedelta(hours=1)).isoformat(),
            "diaper_type": "WET"
        }
    )

    # 一覧取得
    response = client.get(f"/api/diapers/?baby_id={baby_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "recorded_by_display_name" in data[0]
    assert "comment_count" in data[0]

def test_update_diaper(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    # 作成
    resp = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now().isoformat(),
            "diaper_type": "WET"
        }
    )
    diaper_id = resp.json()["id"]

    # 更新
    new_time = (datetime.now() - timedelta(minutes=30)).isoformat()
    response = client.put(
        f"/api/diapers/{diaper_id}",
        json={
            "diaper_type": "BOTH",
            "notes": "更新後のメモ",
            "change_time": new_time
        }
    )
    assert response.status_code == 200
    assert response.json()["diaper_type"] == "BOTH"
    assert response.json()["notes"] == "更新後のメモ"

def test_delete_diaper(client: TestClient, auth_client, db):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    # 作成
    resp = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now().isoformat(),
            "diaper_type": "WET"
        }
    )
    diaper_id = resp.json()["id"]

    # 削除
    response = client.delete(f"/api/diapers/{diaper_id}")
    assert response.status_code == 200
    
    # データベースに存在しないことを確認
    assert db.query(Diaper).filter(Diaper.id == diaper_id).first() is None

def test_diaper_access_control(client: TestClient, auth_client):
    # ユーザー1が赤ちゃんを登録
    client1 = auth_client(username="user1", family_name="Family1")
    baby_res = client1.post("/api/babies/", json={"name": "赤ちゃん1", "gender": "girl"})
    baby_id = baby_res.json()["id"]
    
    # ユーザー1が記録を作成
    diaper_res = client1.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now().isoformat(),
            "diaper_type": "WET"
        }
    )
    diaper_id = diaper_res.json()["id"]

    # ユーザー2（別の家族）がログイン
    client2 = auth_client(username="user2", family_name="Family2")
    
    # 他の家族の赤ちゃんの一覧を取得しようとする -> 403
    resp_get = client2.get(f"/api/diapers/?baby_id={baby_id}")
    assert resp_get.status_code == 403
    
    # 他の家族の記録を更新しようとする -> 403
    resp_put = client2.put(f"/api/diapers/{diaper_id}", json={"notes": "不正アクセス"})
    assert resp_put.status_code == 403
    
    # 他の家族の記録を削除しようとする -> 403
    resp_del = client2.delete(f"/api/diapers/{diaper_id}")
    assert resp_del.status_code == 403

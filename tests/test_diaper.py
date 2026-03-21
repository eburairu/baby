import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
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
            "change_time": datetime.now(timezone.utc).isoformat(),
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
            "change_time": datetime.now(timezone.utc).isoformat(),
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
            "change_time": datetime.now(timezone.utc).isoformat(),
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
            "change_time": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
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
            "change_time": datetime.now(timezone.utc).isoformat(),
            "diaper_type": "WET"
        }
    )
    diaper_id = resp.json()["id"]

    # 更新
    new_time = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
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
            "change_time": datetime.now(timezone.utc).isoformat(),
            "diaper_type": "WET"
        }
    )
    diaper_id = resp.json()["id"]

    # 削除
    response = client.delete(f"/api/diapers/{diaper_id}")
    assert response.status_code == 200
    
    # データベースに論理削除されていることを確認
    record = db.query(Diaper).filter(Diaper.id == diaper_id).execution_options(include_deleted=True).first()
    assert record is not None
    assert record.is_deleted is True

def test_create_diaper_with_poop_details(client: TestClient, auth_client):
    """うんち詳細フィールド（色・状態・量）を持つDiaperの作成テスト"""
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    assert baby_res.status_code == 200
    baby_id = baby_res.json()["id"]

    resp = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now(timezone.utc).isoformat(),
            "diaper_type": "DIRTY",
            "poop_color": "黄色",
            "poop_consistency": "やわらかい",
            "poop_amount": "普通",
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["poop_color"] == "黄色"
    assert data["poop_consistency"] == "やわらかい"
    assert data["poop_amount"] == "普通"


def test_poop_details_null_for_wet(client: TestClient, auth_client):
    """WETタイプのDiaperではpoop詳細がnullであることを確認"""
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    resp = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now(timezone.utc).isoformat(),
            "diaper_type": "WET",
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["poop_color"] is None
    assert data["poop_consistency"] is None
    assert data["poop_amount"] is None


def test_update_diaper_poop_details(client: TestClient, auth_client):
    """DiaperのPUT APIでpoop詳細フィールドを更新できることを確認"""
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    resp = client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now(timezone.utc).isoformat(),
            "diaper_type": "DIRTY",
        }
    )
    diaper_id = resp.json()["id"]

    update_resp = client.put(
        f"/api/diapers/{diaper_id}",
        json={
            "poop_color": "緑",
            "poop_amount": "多量",
            "poop_consistency": "水様",
        }
    )
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["poop_color"] == "緑"
    assert data["poop_amount"] == "多量"
    assert data["poop_consistency"] == "水様"


def test_poop_details_in_list_response(client: TestClient, auth_client):
    """GETのレスポンスにpoop詳細フィールドが含まれることを確認"""
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "gender": "boy"})
    baby_id = baby_res.json()["id"]

    client.post(
        "/api/diapers/",
        json={
            "baby_id": baby_id,
            "change_time": datetime.now(timezone.utc).isoformat(),
            "diaper_type": "BOTH",
            "poop_color": "茶色",
            "poop_amount": "少量",
        }
    )

    resp = client.get(f"/api/diapers/?baby_id={baby_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert "poop_color" in data[0]
    assert "poop_consistency" in data[0]
    assert "poop_amount" in data[0]
    assert data[0]["poop_color"] == "茶色"
    assert data[0]["poop_amount"] == "少量"


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
            "change_time": datetime.now(timezone.utc).isoformat(),
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

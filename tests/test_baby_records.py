import pytest
from datetime import datetime, timedelta, timezone

def test_baby_crud(auth_client):
    client = auth_client()
    # 赤ちゃん登録
    response = client.post(
        "/api/babies/",
        json={"name": "太郎", "birthday": "2024-01-01", "gender": "male"}
    )
    assert response.status_code == 200
    baby_id = response.json()["id"]
    
    # 取得
    response = client.get("/api/babies/")
    assert any(b["id"] == baby_id for b in response.json())

def test_feeding_record(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "太郎", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]
    
    # 授乳記録作成
    response = client.post(
        "/api/feedings/",
        json={
            "baby_id": baby_id,
            "feeding_time": datetime.now().isoformat(),
            "feeding_type": "breast",
            "amount_ml": 100
        }
    )
    assert response.status_code == 200
    assert response.json()["amount_ml"] == 100

def test_contraction_interval_calculation(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "太郎", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]
    
    # 1回目の陣痛
    start1 = datetime.now() - timedelta(minutes=10)
    client.post(
        "/api/contractions/",
        json={
            "baby_id": baby_id,
            "start_time": start1.isoformat(),
            "duration_seconds": 60
        }
    )
    
    # 2回目の陣痛 (5分後)
    start2 = start1 + timedelta(minutes=5)
    response = client.post(
        "/api/contractions/",
        json={
            "baby_id": baby_id,
            "start_time": start2.isoformat(),
            "duration_seconds": 60
        }
    )
    
    assert response.status_code == 200
    # サーバーサイドで interval_seconds が 300秒 (5分) と計算されるか
    assert response.json()["interval_seconds"] == 300

def test_access_control(auth_client, client):
    # ユーザーAが赤ちゃんを登録
    client_a = auth_client(username="user_a", family_name="Family A")
    res = client_a.post("/api/babies/", json={"name": "Baby A"})
    baby_a_id = res.json()["id"]
    client_a.cookies.clear()
    
    # ユーザーB (別の家族) がユーザーAの赤ちゃんデータにアクセスしようとする
    client_b = auth_client(username="user_b", family_name="Family B")
    response = client_b.get(f"/api/contractions/?baby_id={baby_a_id}")
    
    # 403 Forbidden になるはず
    assert response.status_code == 403

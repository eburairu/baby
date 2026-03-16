import pytest
from datetime import datetime, timezone

def test_feeding_creation_resets_timer(auth_client):
    """授乳記録作成時に reset_timer=True を指定すると、タイマーがリセットされることを確認"""
    client = auth_client()
    
    # ベビー作成
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    # 1. タイマーを開始状態にする
    client.put(
        f"/api/babies/{baby_id}/timer/feeding",
        json={
            "active_side": "LEFT",
            "left_elapsed_seconds": 30,
            "right_elapsed_seconds": 0,
            "segment_start_time": "2026-01-01T10:00:00Z"
        }
    )
    
    # タイマーが開始されていることを確認
    timer_res = client.get(f"/api/babies/{baby_id}/timer/feeding")
    assert timer_res.json()["active_side"] == "LEFT"

    # 2. 授乳記録を作成（reset_timer=True）
    feeding_data = {
        "baby_id": baby_id,
        "feeding_time": "2026-01-01T11:00:00Z",
        "feeding_type": "BREAST",
        "left_breast_minutes": 5,
        "right_breast_minutes": 5,
        "reset_timer": True
    }
    
    res = client.post("/api/feedings/", json=feeding_data)
    assert res.status_code == 200
    
    # 3. タイマーの状態を確認
    timer_res = client.get(f"/api/babies/{baby_id}/timer/feeding")
    # 実装後はリセットされているはず
    assert timer_res.json()["active_side"] is None
    assert timer_res.json()["left_elapsed_seconds"] == 0
    assert timer_res.json()["right_elapsed_seconds"] == 0
    assert timer_res.json()["segment_start_time"] is None


def test_contraction_creation_resets_timer(auth_client):
    """陣痛記録作成時に reset_timer=True を指定すると、タイマーがリセットされることを確認"""
    client = auth_client()
    
    # ベビー作成
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    # 1. タイマーを開始状態にする
    client.put(
        f"/api/babies/{baby_id}/timer/contraction",
        json={"status": "timing", "start_time": "2026-01-01T10:00:00Z"}
    )
    
    # タイマーが開始されていることを確認
    timer_res = client.get(f"/api/babies/{baby_id}/timer/contraction")
    assert timer_res.json()["status"] == "timing"

    # 2. 陣痛記録を作成（reset_timer=True）
    contraction_data = {
        "baby_id": baby_id,
        "start_time": "2026-01-01T11:00:00Z",
        "end_time": "2026-01-01T11:01:00Z",
        "duration_seconds": 60,
        "reset_timer": True
    }
    
    res = client.post("/api/contractions/", json=contraction_data)
    assert res.status_code == 200
    
    # 3. タイマーの状態を確認
    timer_res = client.get(f"/api/babies/{baby_id}/timer/contraction")
    # 実装後は idle になっているはず
    assert timer_res.json()["status"] == "idle"
    assert timer_res.json()["start_time"] is None

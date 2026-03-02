"""
授乳タイマー API の TDD RED テスト

エンドポイント:
  GET  /api/babies/{baby_id}/timer/feeding
  PUT  /api/babies/{baby_id}/timer/feeding

このテストは実装前に作成されたため、全テストが FAILED になることを確認済み。
"""


def test_get_feeding_timer_initial_state(auth_client):
    """GET で初期状態 active_side=null, left/right=0, segment_start_time=null が返る"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    response = client.get(f"/api/babies/{baby_id}/timer/feeding")
    assert response.status_code == 200
    data = response.json()
    assert data["active_side"] is None
    assert data["left_elapsed_seconds"] == 0
    assert data["right_elapsed_seconds"] == 0
    assert data["segment_start_time"] is None


def test_put_feeding_timer_start_left(auth_client):
    """PUT {active_side: LEFT, ...} で 200 が返り、更新後の値が返る"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    response = client.put(
        f"/api/babies/{baby_id}/timer/feeding",
        json={
            "active_side": "LEFT",
            "left_elapsed_seconds": 30,
            "right_elapsed_seconds": 0,
            "segment_start_time": "2026-01-01T10:00:00Z"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["active_side"] == "LEFT"
    assert data["left_elapsed_seconds"] == 30
    assert data["right_elapsed_seconds"] == 0
    assert data["segment_start_time"] is not None


def test_put_then_get_feeding_timer(auth_client):
    """PUT 後に GET すると全フィールドが更新されている"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    # PUT で LEFT 授乳開始
    client.put(
        f"/api/babies/{baby_id}/timer/feeding",
        json={
            "active_side": "LEFT",
            "left_elapsed_seconds": 30,
            "right_elapsed_seconds": 0,
            "segment_start_time": "2026-01-01T10:00:00Z"
        }
    )

    # GET で更新が反映されているか確認
    response = client.get(f"/api/babies/{baby_id}/timer/feeding")
    assert response.status_code == 200
    data = response.json()
    assert data["active_side"] == "LEFT"
    assert data["left_elapsed_seconds"] == 30
    assert data["right_elapsed_seconds"] == 0
    assert data["segment_start_time"] is not None


def test_put_feeding_timer_reset(auth_client):
    """PUT で active_side=null, segment_start_time=null にリセットできる"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    # まず LEFT 授乳を開始
    client.put(
        f"/api/babies/{baby_id}/timer/feeding",
        json={
            "active_side": "LEFT",
            "left_elapsed_seconds": 60,
            "right_elapsed_seconds": 0,
            "segment_start_time": "2026-01-01T10:00:00Z"
        }
    )

    # リセット（active_side: null, elapsed ゼロ）
    response = client.put(
        f"/api/babies/{baby_id}/timer/feeding",
        json={
            "active_side": None,
            "left_elapsed_seconds": 0,
            "right_elapsed_seconds": 0,
            "segment_start_time": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["active_side"] is None
    assert data["left_elapsed_seconds"] == 0
    assert data["right_elapsed_seconds"] == 0
    assert data["segment_start_time"] is None


def test_feeding_timer_cross_family_403(auth_client):
    """別家族ユーザーが GET すると 403 を返す"""
    # Family A がベビーを作成
    client_a = auth_client(username="user_family_a", family_name="Family A")
    res = client_a.post("/api/babies/", json={"name": "Baby A", "birthday": "2026-01-01"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # Family B がアクセスしようとする
    client_b = auth_client(username="user_family_b", family_name="Family B")
    response = client_b.get(f"/api/babies/{baby_id}/timer/feeding")
    assert response.status_code == 403


def test_feeding_timer_unauthenticated_401(client):
    """未認証で GET すると 401 を返す"""
    response = client.get("/api/babies/1/timer/feeding")
    assert response.status_code == 401

"""
陣痛タイマー API の TDD RED テスト

エンドポイント:
  GET  /api/babies/{baby_id}/timer/contraction
  PUT  /api/babies/{baby_id}/timer/contraction

このテストは実装前に作成されたため、全テストが FAILED になることを確認済み。
"""


def test_get_contraction_timer_initial_state(auth_client):
    """GET で初期状態 status=idle, start_time=null が返る"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    response = client.get(f"/api/babies/{baby_id}/timer/contraction")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "idle"
    assert data["start_time"] is None


def test_put_contraction_timer_start(auth_client):
    """PUT {status: timing, start_time: ...} で 200 が返り、更新後の値が返る"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    response = client.put(
        f"/api/babies/{baby_id}/timer/contraction",
        json={"status": "timing", "start_time": "2026-01-01T10:00:00Z"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "timing"
    assert data["start_time"] is not None


def test_put_then_get_contraction_timer(auth_client):
    """PUT 後に GET すると更新された status と start_time が返る"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    # PUT で timing 状態に更新
    client.put(
        f"/api/babies/{baby_id}/timer/contraction",
        json={"status": "timing", "start_time": "2026-01-01T10:00:00Z"}
    )

    # GET で更新が反映されているか確認
    response = client.get(f"/api/babies/{baby_id}/timer/contraction")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "timing"
    assert data["start_time"] is not None


def test_put_contraction_timer_reset(auth_client):
    """PUT {status: idle, start_time: null} でリセットできる"""
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2026-01-01"})
    baby_id = res.json()["id"]

    # まず timing に設定
    client.put(
        f"/api/babies/{baby_id}/timer/contraction",
        json={"status": "timing", "start_time": "2026-01-01T10:00:00Z"}
    )

    # idle にリセット
    response = client.put(
        f"/api/babies/{baby_id}/timer/contraction",
        json={"status": "idle", "start_time": None}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "idle"
    assert data["start_time"] is None


def test_contraction_timer_cross_family_403(auth_client):
    """別家族ユーザーが GET すると 403 を返す"""
    # Family A がベビーを作成
    client_a = auth_client(username="user_family_a", family_name="Family A")
    res = client_a.post("/api/babies/", json={"name": "Baby A", "birthday": "2026-01-01"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # Family B がアクセスしようとする
    client_b = auth_client(username="user_family_b", family_name="Family B")
    response = client_b.get(f"/api/babies/{baby_id}/timer/contraction")
    assert response.status_code == 403


def test_contraction_timer_unauthenticated_401(client):
    """未認証で GET すると 401 を返す"""
    response = client.get("/api/babies/1/timer/contraction")
    assert response.status_code == 401

"""
TDD RED フェーズ: 赤ちゃん閾値フィールドのテスト
feeding_threshold_minutes と diaper_threshold_minutes の CRUD を検証する。

これらのテストは実装前に意図的に FAILED/ERROR になることを確認するために作成された。
"""


def test_threshold_null_by_default(auth_client):
    """閾値を指定せずに作成した場合、feeding_threshold_minutes と diaper_threshold_minutes が null であることを確認。"""
    client = auth_client()

    # 閾値なしで Baby を作成
    res = client.post(
        "/api/babies/",
        json={"name": "DefaultBaby", "birthday": "2025-01-01"},
    )
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # GET /api/babies/ のレスポンスに両フィールドが含まれ null であることを確認
    res = client.get("/api/babies/")
    assert res.status_code == 200
    babies = res.json()
    target = next(b for b in babies if b["id"] == baby_id)

    assert "feeding_threshold_minutes" in target
    assert "diaper_threshold_minutes" in target
    assert target["feeding_threshold_minutes"] is None
    assert target["diaper_threshold_minutes"] is None


def test_baby_response_includes_threshold_fields(auth_client):
    """POST /api/babies/ のレスポンスに feeding_threshold_minutes と diaper_threshold_minutes が含まれることを確認。"""
    client = auth_client(username="user_resp", password="password123", family_name="RespFamily")

    res = client.post(
        "/api/babies/",
        json={"name": "RespBaby", "birthday": "2025-02-01"},
    )
    assert res.status_code == 200
    data = res.json()

    assert "feeding_threshold_minutes" in data
    assert "diaper_threshold_minutes" in data


def test_create_baby_with_thresholds(auth_client):
    """POST /api/babies/ で閾値を指定して作成し、レスポンスに指定した値が返ることを確認。"""
    client = auth_client(username="user_create", password="password123", family_name="CreateFamily")

    res = client.post(
        "/api/babies/",
        json={
            "name": "ThresholdBaby",
            "birthday": "2025-03-01",
            "feeding_threshold_minutes": 180,
            "diaper_threshold_minutes": 240,
        },
    )
    assert res.status_code == 200
    data = res.json()

    assert data["feeding_threshold_minutes"] == 180
    assert data["diaper_threshold_minutes"] == 240


def test_update_baby_thresholds(auth_client):
    """PATCH /api/babies/{id} で閾値を部分更新できることを確認。"""
    client = auth_client(username="user_update", password="password123", family_name="UpdateFamily")

    # Baby を作成
    res = client.post(
        "/api/babies/",
        json={"name": "UpdateBaby", "birthday": "2025-04-01"},
    )
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # feeding_threshold_minutes を 120 に更新
    res = client.patch(
        f"/api/babies/{baby_id}",
        json={"feeding_threshold_minutes": 120},
    )
    assert res.status_code == 200

    # GET で 120 が返ることを確認
    res = client.get("/api/babies/")
    assert res.status_code == 200
    babies = res.json()
    target = next(b for b in babies if b["id"] == baby_id)
    assert target["feeding_threshold_minutes"] == 120

    # diaper_threshold_minutes を 300 に更新（feeding は変わらないことを確認）
    res = client.patch(
        f"/api/babies/{baby_id}",
        json={"diaper_threshold_minutes": 300},
    )
    assert res.status_code == 200

    # GET で両フィールドを確認
    res = client.get("/api/babies/")
    assert res.status_code == 200
    babies = res.json()
    target = next(b for b in babies if b["id"] == baby_id)
    assert target["diaper_threshold_minutes"] == 300
    assert target["feeding_threshold_minutes"] == 120  # 部分更新：変更されていないこと


def test_threshold_family_shared(auth_client):
    """管理者が設定した閾値が DB に保存され GET で取得できることを確認。"""
    # THRES-03: Family sharing is verified at DB level; cross-user test in Phase 7 integration
    client = auth_client(username="user_shared", password="password123", family_name="SharedFamily")

    # Baby を作成
    res = client.post(
        "/api/babies/",
        json={"name": "SharedBaby", "birthday": "2025-05-01"},
    )
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # feeding_threshold_minutes を 150 に設定
    res = client.patch(
        f"/api/babies/{baby_id}",
        json={"feeding_threshold_minutes": 150},
    )
    assert res.status_code == 200

    # 同一クライアントで GET して値が保存されていることを確認
    res = client.get("/api/babies/")
    assert res.status_code == 200
    babies = res.json()
    target = next(b for b in babies if b["id"] == baby_id)
    assert target["feeding_threshold_minutes"] == 150

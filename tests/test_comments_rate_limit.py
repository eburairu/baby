import pytest
from app.routers.comments import comment_limiter

@pytest.fixture(autouse=True)
def reset_limiter():
    # テスト前にリミッターの状態をリセット
    comment_limiter.requests.clear()
    yield
    comment_limiter.requests.clear()

def test_comment_rate_limit(auth_client, db):
    client = auth_client()

    # 準備: 赤ちゃん作成 -> 記録作成
    res = client.post("/api/babies/", json={"name": "Baby RateLimit"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    res = client.post(f"/api/babies/{baby_id}/records", json={
        "type": "feeding",
        "timestamp": "2024-03-20T10:00:00Z"
    })
    assert res.status_code == 200
    record_id = res.json()["id"]

    # 制限回数 (10回) までは成功
    for i in range(10):
        res = client.post(f"/api/records/feeding/{record_id}/comments", json={
            "content": f"Comment {i}"
        })
        assert res.status_code == 200, f"Failed at iteration {i}"

    # 11回目は失敗
    res = client.post(f"/api/records/feeding/{record_id}/comments", json={
        "content": "Comment 11"
    })
    assert res.status_code == 429
    assert res.json()["detail"] == "Too many comments. Please wait a moment."

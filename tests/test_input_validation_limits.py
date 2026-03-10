from datetime import datetime, timezone
import pytest

def test_baby_input_validation(auth_client):
    # 認証済みクライアントを取得
    client = auth_client()

    # 1. Baby Name Length Limit (Example: > 100 chars)
    long_name = "a" * 101
    baby_payload = {
        "name": long_name,
        "birthday": datetime.now(timezone.utc).date().isoformat(),
        "gender": "boy",
        "characteristics": "Normal length"
    }
    res = client.post("/api/babies/", json=baby_payload)

    # 現在は制限がないので200になるはずだが、修正後は422になるべき
    assert res.status_code == 422, f"Expected 422 for long name, got {res.status_code}"

    # 2. Baby Characteristics Length Limit (Example: > 1000 chars)
    long_chars = "b" * 1001
    baby_payload_chars = {
        "name": "Normal Baby",
        "birthday": datetime.now(timezone.utc).date().isoformat(),
        "gender": "girl",
        "characteristics": long_chars
    }
    res = client.post("/api/babies/", json=baby_payload_chars)
    assert res.status_code == 422, f"Expected 422 for long characteristics, got {res.status_code}"

def test_comment_input_validation(auth_client):
    client = auth_client()

    # まず正常な赤ちゃんを作成
    baby_payload = {
        "name": "Comment Baby",
        "birthday": datetime.now(timezone.utc).date().isoformat(),
        "gender": "boy"
    }
    res = client.post("/api/babies/", json=baby_payload)
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # 記録を作成 (例: Feeding)
    feeding_payload = {
        "baby_id": baby_id,
        "feeding_time": datetime.now(timezone.utc).isoformat(),
        "feeding_type": "BOTTLE",
        "amount_ml": 100
    }
    res = client.post("/api/feedings/", json=feeding_payload)
    assert res.status_code == 200
    feeding_id = res.json()["id"]

    # 3. Comment Content Length Limit (Example: > 2000 chars)
    long_content = "c" * 2001
    comment_payload = {
        "content": long_content
    }
    # 正しいエンドポイントを使用
    res = client.post(f"/api/records/feeding/{feeding_id}/comments", json=comment_payload)
    assert res.status_code == 422, f"Expected 422 for long comment, got {res.status_code}"

def test_baby_name_cannot_be_null(auth_client):
    client = auth_client()

    # 1. Create a baby
    baby_payload = {
        "name": "Original Name",
        "birthday": datetime.now(timezone.utc).date().isoformat(),
        "gender": "boy"
    }
    res = client.post("/api/babies/", json=baby_payload)
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # 2. Try to update name to null
    update_payload = {
        "name": None
    }
    res = client.patch(f"/api/babies/{baby_id}", json=update_payload)

    # Expect 422 Unprocessable Entity, but currently it might be 500
    assert res.status_code == 422, f"Expected 422 for null name, got {res.status_code}"

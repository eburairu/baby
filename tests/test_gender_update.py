import pytest

def test_update_baby_gender(auth_client):
    client = auth_client()
    # 1. 赤ちゃん登録 (初期は unknown)
    response = client.post(
        "/api/babies/",
        json={"name": "太郎", "birthday": "2024-01-01", "gender": "unknown"}
    )
    assert response.status_code == 200
    baby_id = response.json()["id"]
    assert response.json()["gender"] == "unknown"
    
    # 2. 性別を boy に更新
    response = client.patch(
        f"/api/babies/{baby_id}",
        json={"gender": "boy"}
    )
    assert response.status_code == 200
    assert response.json()["gender"] == "boy"

    # 3. 性別を girl に更新
    response = client.patch(
        f"/api/babies/{baby_id}",
        json={"gender": "girl"}
    )
    assert response.status_code == 200
    assert response.json()["gender"] == "girl"

    # 4. 無効な値を送信 (バリデーションエラーになるはず)
    response = client.patch(
        f"/api/babies/{baby_id}",
        json={"gender": "male"}
    )
    assert response.status_code == 422

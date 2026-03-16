import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.baby import Baby
from app.models.feeding import Feeding
from datetime import datetime, timezone

def test_baby_soft_delete(auth_client, db: Session):
    client = auth_client()
    
    # 1. 赤ちゃんを登録する
    res = client.post(
        "/api/babies/",
        json={"name": "テスト太郎", "birthday": "2024-01-01", "gender": "boy"}
    )
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # 2. 赤ちゃんを削除する
    response = client.delete(f"/api/babies/{baby_id}")
    assert response.status_code == 204

    # 3. データベース上にレコードが残っていることを確認 (物理削除されていない)
    # 論理削除導入後は is_deleted=True のレコードが取得できるはず
    # まだ導入されていない現在は、物理削除されているため None になるはず
    baby_in_db = db.query(Baby).execution_options(include_deleted=True).filter(Baby.id == baby_id).first()
    assert baby_in_db is not None, "Baby should not be physically deleted"
    assert getattr(baby_in_db, "is_deleted", False) is True, "Baby should be marked as deleted"

    # 4. 通常の GET API で取得できないことを確認
    response = client.get("/api/babies/")
    assert response.status_code == 200
    babies = response.json()
    assert all(b["id"] != baby_id for b in babies)

def test_feeding_soft_delete(auth_client, db: Session):
    client = auth_client()
    
    # 1. 赤ちゃんを登録する
    res = client.post(
        "/api/babies/",
        json={"name": "テスト太郎", "birthday": "2024-01-01"}
    )
    baby_id = res.json()["id"]

    # 2. 授乳記録を作成する
    response = client.post(
        "/api/feedings/",
        json={
            "baby_id": baby_id,
            "feeding_time": datetime.now(timezone.utc).isoformat(),
            "feeding_type": "BREAST",
            "amount_ml": 100
        }
    )
    assert response.status_code == 200
    feeding_id = response.json()["id"]

    # 3. 授乳記録を削除する
    response = client.delete(f"/api/feedings/{feeding_id}")
    assert response.status_code == 200

    # 4. データベース上にレコードが残っていることを確認
    feeding_in_db = db.query(Feeding).execution_options(include_deleted=True).filter(Feeding.id == feeding_id).first()
    assert feeding_in_db is not None, "Feeding should not be physically deleted"
    assert getattr(feeding_in_db, "is_deleted", False) is True, "Feeding should be marked as deleted"

    # 5. 通常の GET API で取得できないことを確認
    response = client.get(f"/api/babies/{baby_id}/records")
    records = response.json()
    assert all(r["id"] != feeding_id for r in records if r["type"] == "feeding")

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from app.models.achievement import BabyAchievement
from tests.conftest import TestingSessionLocal

def test_deleted_achievement_fallback(auth_client, db):
    c = auth_client()
    
    # 1. 赤ちゃんを作成
    baby_res = c.post("/api/babies/", json={"name": "テスト赤ちゃん", "birthday": "2024-01-01"})
    assert baby_res.status_code == 200
    baby_id = baby_res.json()["id"]
    
    # 2. 存在しない実績IDを持つレコードを直接挿入
    # current_user.id を取得するために API を一度叩くか、auth_client の仕組みから推測
    # ここでは triggered_by_user_id は None でもよい
    deleted_achievement = BabyAchievement(
        baby_id=baby_id,
        achievement_id="non_existent_achievement_id",
        achieved_at=datetime.now(timezone.utc)
    )
    db.add(deleted_achievement)
    db.commit()
        
    # 3. 実績一覧 API を叩く
    resp = c.get(f"/api/achievements/?baby_id={baby_id}")
    assert resp.status_code == 200
    
    data = resp.json()
    # 現在の実装ではスキップされるため、空リストになるはず（Red確認）
    # 期待される動作は、1件含まれていてフォールバック値が入っていること
    assert len(data) == 1
    achievement = data[0]
    assert achievement["achievement_id"] == "non_existent_achievement_id"
    assert achievement["name"] == "レガシー実績"
    assert achievement["icon"] == "❓"
    assert achievement["description"] == "現在は取得できない実績です"

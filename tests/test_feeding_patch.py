import pytest
from app.models.feeding import Feeding, FeedingType
from app.models.baby import Baby
from datetime import datetime

def test_update_feeding_notes(auth_client, db):
    # 認証済みクライアントの取得
    client = auth_client(username="feeder", password="password123")
    
    # ユーザー情報を取得
    response_me = client.get("/api/auth/me")
    user_id = response_me.json()["id"]

    # 赤ちゃんの作成（auth_client で作成された家族IDが必要だが、ここでは手動で作成しても、auth_clientが作成したユーザーの家族IDを取得しても良い）
    # auth_client は登録直後のユーザーをログインさせているので、そのユーザーの家族に赤ちゃんを追加する
    from app.models.family import FamilyUser
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    family_id = fu.family_id

    baby = Baby(family_id=family_id, name="Test Baby", birthday=datetime.now().date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    # 授乳記録の作成
    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(),
        feeding_type=FeedingType.BOTTLE,
        notes="Old note"
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    # PATCH テスト
    new_notes = "Updated note via PATCH"
    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"notes": new_notes}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == new_notes

    # DB確認
    db.refresh(feeding)
    assert feeding.notes == new_notes

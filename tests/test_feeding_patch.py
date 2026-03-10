import pytest
from app.models.feeding import Feeding, FeedingType
from app.models.baby import Baby
from datetime import datetime, timezone

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

    baby = Baby(family_id=family_id, name="Test Baby", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    # 授乳記録の作成
    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
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

def test_update_feeding_duration_auto_calc(auth_client, db):
    # 認証済みクライアント
    client = auth_client(username="feeder2", password="password123")
    user_id = client.get("/api/auth/me").json()["id"]
    from app.models.family import FamilyUser
    family_id = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first().family_id

    # 赤ちゃんの作成
    baby = Baby(family_id=family_id, name="Test Baby 2", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    # 授乳記録の作成 (最初は左右なし)
    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.BREAST,
        duration_minutes=10
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    # PATCH テスト: 左右の時間を更新
    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={
            "left_breast_minutes": 7,
            "right_breast_minutes": 8
        }
    )

    assert response.status_code == 200
    data = response.json()
    # duration_minutes が 7 + 8 = 15 に更新されているはず
    assert data["duration_minutes"] == 15
    assert data["left_breast_minutes"] == 7
    assert data["right_breast_minutes"] == 8

    # DB確認
    db.refresh(feeding)
    assert feeding.duration_minutes == 15

def test_update_feeding_burped(auth_client, db):
    """ゲップ（burped）フィールドの更新テスト"""
    client = auth_client(username="feeder_burp", password="password123")
    user_id = client.get("/api/auth/me").json()["id"]
    from app.models.family import FamilyUser
    family_id = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first().family_id

    baby = Baby(family_id=family_id, name="Burp Test Baby", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.BOTTLE,
        burped=None,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    # None → True に更新
    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"burped": True}
    )
    assert response.status_code == 200
    assert response.json()["burped"] is True
    db.refresh(feeding)
    assert feeding.burped is True

    # True → False に更新
    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"burped": False}
    )
    assert response.status_code == 200
    assert response.json()["burped"] is False
    db.refresh(feeding)
    assert feeding.burped is False


def test_create_feeding_with_burped(auth_client, db):
    """ゲップ（burped）フィールドを含む授乳記録の作成テスト"""
    client = auth_client(username="feeder_burp2", password="password123")
    user_id = client.get("/api/auth/me").json()["id"]
    from app.models.family import FamilyUser
    family_id = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first().family_id

    baby = Baby(family_id=family_id, name="Burp Test Baby 2", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    db.refresh(baby)

    response = client.post(
        "/api/feedings/",
        json={
            "baby_id": baby.id,
            "feeding_time": datetime.now(timezone.utc).isoformat(),
            "feeding_type": "BOTTLE",
            "burped": True,
        }
    )
    assert response.status_code == 200
    assert response.json()["burped"] is True

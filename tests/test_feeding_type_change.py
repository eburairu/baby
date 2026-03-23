"""
授乳種別(FeedingType)変更時における不要なフィールドの残存バグの修正テスト

Issue #1132: FeedingTypeを変更した際に、変更前の種別に固有なフィールドが
DBに残留しないことを確認する。
"""
from app.models.feeding import Feeding
from app.models.enums import FeedingType, BreastSide, BottleContentType
from app.models.baby import Baby
from datetime import datetime, timezone


def _make_client(auth_client, username):
    return auth_client(username=username, password="password123")


def _get_family_id(db, user_id):
    from app.models.family import FamilyUser
    return db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first().family_id


def _make_baby(db, family_id, name):
    baby = Baby(family_id=family_id, name=name, birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return baby


def test_breast_to_bottle_clears_breast_fields(auth_client, db):
    """母乳(BREAST)→哺乳瓶(BOTTLE)変更時に母乳固有フィールドがNullになること"""
    client = _make_client(auth_client, "typechange_b2b_1")
    user_id = client.get("/api/auth/me").json()["id"]
    baby = _make_baby(db, _get_family_id(db, user_id), "BabyB2B1")

    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.BREAST,
        left_breast_minutes=10,
        right_breast_minutes=8,
        last_breast_side=BreastSide.RIGHT,
        duration_minutes=18,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"feeding_type": "BOTTLE", "amount_ml": 100.0},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["feeding_type"] == "BOTTLE"
    assert data["amount_ml"] == 100.0
    # 母乳固有フィールドがクリアされていること
    assert data["left_breast_minutes"] is None
    assert data["right_breast_minutes"] is None
    assert data["last_breast_side"] is None
    assert data["duration_minutes"] is None

    db.refresh(feeding)
    assert feeding.left_breast_minutes is None
    assert feeding.right_breast_minutes is None
    assert feeding.last_breast_side is None
    assert feeding.duration_minutes is None


def test_bottle_to_breast_clears_bottle_fields(auth_client, db):
    """哺乳瓶(BOTTLE)→母乳(BREAST)変更時にボトル固有フィールドがNullになること"""
    client = _make_client(auth_client, "typechange_b2b_2")
    user_id = client.get("/api/auth/me").json()["id"]
    baby = _make_baby(db, _get_family_id(db, user_id), "BabyB2B2")

    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.BOTTLE,
        amount_ml=120.0,
        bottle_content_type=BottleContentType.FORMULA,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"feeding_type": "BREAST", "left_breast_minutes": 12},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["feeding_type"] == "BREAST"
    assert data["left_breast_minutes"] == 12
    # ボトル固有フィールドがクリアされていること
    assert data["amount_ml"] is None
    assert data["bottle_content_type"] is None

    db.refresh(feeding)
    assert feeding.amount_ml is None
    assert feeding.bottle_content_type is None


def test_mixed_to_breast_clears_bottle_fields(auth_client, db):
    """混合(MIXED)→母乳(BREAST)変更時にボトル固有フィールドがNullになること"""
    client = _make_client(auth_client, "typechange_m2b_1")
    user_id = client.get("/api/auth/me").json()["id"]
    baby = _make_baby(db, _get_family_id(db, user_id), "BabyM2B1")

    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.MIXED,
        amount_ml=50.0,
        bottle_content_type=BottleContentType.EXPRESSED_MILK,
        left_breast_minutes=5,
        right_breast_minutes=5,
        duration_minutes=10,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"feeding_type": "BREAST"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["feeding_type"] == "BREAST"
    # ボトル固有フィールドがクリアされていること
    assert data["amount_ml"] is None
    assert data["bottle_content_type"] is None
    # 母乳フィールドは残っていること
    assert data["left_breast_minutes"] == 5
    assert data["right_breast_minutes"] == 5


def test_mixed_to_bottle_clears_breast_fields(auth_client, db):
    """混合(MIXED)→哺乳瓶(BOTTLE)変更時に母乳固有フィールドがNullになること"""
    client = _make_client(auth_client, "typechange_m2b_2")
    user_id = client.get("/api/auth/me").json()["id"]
    baby = _make_baby(db, _get_family_id(db, user_id), "BabyM2B2")

    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.MIXED,
        amount_ml=60.0,
        bottle_content_type=BottleContentType.FORMULA,
        left_breast_minutes=7,
        right_breast_minutes=3,
        last_breast_side=BreastSide.LEFT,
        duration_minutes=10,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"feeding_type": "BOTTLE", "amount_ml": 80.0},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["feeding_type"] == "BOTTLE"
    assert data["amount_ml"] == 80.0
    # 母乳固有フィールドがクリアされていること
    assert data["left_breast_minutes"] is None
    assert data["right_breast_minutes"] is None
    assert data["last_breast_side"] is None
    assert data["duration_minutes"] is None

    db.refresh(feeding)
    assert feeding.left_breast_minutes is None
    assert feeding.right_breast_minutes is None
    assert feeding.last_breast_side is None
    assert feeding.duration_minutes is None


def test_same_type_update_does_not_clear_fields(auth_client, db):
    """同一種別での更新時にフィールドがクリアされないこと"""
    client = _make_client(auth_client, "typechange_same")
    user_id = client.get("/api/auth/me").json()["id"]
    baby = _make_baby(db, _get_family_id(db, user_id), "BabySame")

    feeding = Feeding(
        user_id=user_id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.BREAST,
        left_breast_minutes=10,
        right_breast_minutes=8,
        duration_minutes=18,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    response = client.patch(
        f"/api/feedings/{feeding.id}",
        json={"notes": "更新のみ"},
    )

    assert response.status_code == 200
    data = response.json()
    # 種別を変更していないのでフィールドは保持されること
    assert data["left_breast_minutes"] == 10
    assert data["right_breast_minutes"] == 8
    assert data["duration_minutes"] == 18

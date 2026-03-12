"""
Issue #868: 主要な記録モデルへの created_at / updated_at カラムの追加
TDDテスト: 実装前は全てRedになることを確認する
"""
import pytest
from datetime import datetime, timezone
from sqlalchemy import inspect

from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.vaccination import Vaccination
from app.models.milestone import Milestone
from app.models.temperature import TemperatureRecord
from app.models.schedule import Schedule
from app.models.note import Note


RECORD_MODELS = [
    Feeding,
    Sleep,
    Diaper,
    Growth,
    Contraction,
    Vaccination,
    Milestone,
    TemperatureRecord,
    Schedule,
    Note,
]


@pytest.mark.parametrize("model_cls", RECORD_MODELS)
def test_model_has_created_at(model_cls):
    """全記録モデルに created_at カラムが存在すること"""
    mapper = inspect(model_cls)
    column_names = [c.key for c in mapper.columns]
    assert "created_at" in column_names, (
        f"{model_cls.__name__} に created_at カラムがありません"
    )


@pytest.mark.parametrize("model_cls", RECORD_MODELS)
def test_model_has_updated_at(model_cls):
    """全記録モデルに updated_at カラムが存在すること"""
    mapper = inspect(model_cls)
    column_names = [c.key for c in mapper.columns]
    assert "updated_at" in column_names, (
        f"{model_cls.__name__} に updated_at カラムがありません"
    )


def test_feeding_created_at_set_on_insert(db):
    """Feeding作成時に created_at が自動セットされること"""
    from app.models.feeding import FeedingType
    from app.models.baby import Baby
    from app.models.family import Family, FamilyUser
    from app.models.user import User
    from app.models.enums import UserRole

    import uuid
    family = Family(name="Test", invite_code=str(uuid.uuid4()))
    db.add(family)
    db.flush()

    user = User(username="u1", hashed_password="x")
    db.add(user)
    db.flush()

    db.add(FamilyUser(family_id=family.id, user_id=user.id, role=UserRole.ADMIN))
    db.flush()

    baby = Baby(family_id=family.id, name="Baby", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.flush()

    feeding = Feeding(
        user_id=user.id,
        baby_id=baby.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type=FeedingType.BOTTLE,
    )
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    assert feeding.created_at is not None
    assert feeding.updated_at is not None


def test_sleep_created_at_set_on_insert(db):
    """Sleep作成時に created_at が自動セットされること"""
    import uuid
    from app.models.baby import Baby
    from app.models.family import Family, FamilyUser
    from app.models.user import User
    from app.models.enums import UserRole

    family = Family(name="Test2", invite_code=str(uuid.uuid4()))
    db.add(family)
    db.flush()

    user = User(username="u2", hashed_password="x")
    db.add(user)
    db.flush()

    db.add(FamilyUser(family_id=family.id, user_id=user.id, role=UserRole.ADMIN))
    db.flush()

    baby = Baby(family_id=family.id, name="Baby2", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.flush()

    sleep = Sleep(
        user_id=user.id,
        baby_id=baby.id,
        start_time=datetime.now(timezone.utc),
    )
    db.add(sleep)
    db.commit()
    db.refresh(sleep)

    assert sleep.created_at is not None
    assert sleep.updated_at is not None

import pytest
from app.services.record import verify_record_ownership
from app.core.exceptions import InvalidRecordTypeError, RecordNotFoundError
from app.models.feeding import Feeding
from app.models.user import User
from app.models.family import Family
from app.models.baby import Baby
from datetime import datetime, timezone

def test_verify_record_ownership_invalid_type(db):
    with pytest.raises(InvalidRecordTypeError, match="Invalid record_type"):
        verify_record_ownership(db, "invalid_type", 1, 1)

def test_verify_record_ownership_not_found(db):
    with pytest.raises(RecordNotFoundError, match="feeding record 999 not found for baby 1"):
        verify_record_ownership(db, "feeding", 999, 1)

def test_verify_record_ownership_success(db):
    user = User(username="test_user_rec", hashed_password="fake")
    db.add(user)
    db.commit()
    family = Family(name="Test Family", invite_code="TEST-REC")
    db.add(family)
    db.commit()
    baby = Baby(family_id=family.id, name="テストベビー", gender="boy", birthday=datetime.now(timezone.utc).date())
    db.add(baby)
    db.commit()
    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type="BREAST"
    )
    db.add(feeding)
    db.commit()

    # Should not raise
    verify_record_ownership(db, "feeding", feeding.id, baby.id)

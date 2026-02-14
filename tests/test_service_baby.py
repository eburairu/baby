from datetime import date
from sqlalchemy.orm import Session

from app.models.baby import Baby
from app.models.family import Family
from app.schemas.baby import BabyUpdate
from app.services.baby import update_baby, get_baby


def _create_family_and_baby(db: Session):
    family = Family(name="Test Family", invite_code="CODE123")
    db.add(family)
    db.commit()
    db.refresh(family)

    baby = Baby(
        family_id=family.id,
        name="Test Baby",
        birthday=date(2024, 1, 1),
        due_date=date(2024, 1, 10),
        characteristics="Initial characteristics"
    )
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return baby


def test_update_baby_with_pydantic_model(db: Session):
    baby = _create_family_and_baby(db)

    update_data = BabyUpdate(
        name="Updated Baby Name",
        characteristics="Updated characteristics"
    )

    updated_baby = update_baby(db, baby, update_data)

    assert updated_baby.name == "Updated Baby Name"
    assert updated_baby.characteristics == "Updated characteristics"
    # Fields not in update_data should remain unchanged (if exclude_unset=True works)
    # BabyUpdate defaults fields to None, so exclude_unset=True is crucial
    assert updated_baby.birthday == date(2024, 1, 1)


def test_update_baby_with_dict(db: Session):
    baby = _create_family_and_baby(db)

    update_data = {
        "name": "Dict Updated Name",
        "birthday": date(2024, 2, 2)
    }

    updated_baby = update_baby(db, baby, update_data)

    assert updated_baby.name == "Dict Updated Name"
    assert updated_baby.birthday == date(2024, 2, 2)
    assert updated_baby.characteristics == "Initial characteristics"


def test_update_baby_ignores_unknown_fields(db: Session):
    baby = _create_family_and_baby(db)

    update_data = {
        "name": "Partial Update",
        "unknown_field": "Should be ignored",
        "another_random_field": 123
    }

    updated_baby = update_baby(db, baby, update_data)

    assert updated_baby.name == "Partial Update"
    # Ensure no error occurred and unknown fields didn't affect the model
    assert not hasattr(updated_baby, "unknown_field")


def test_get_baby(db: Session):
    created_baby = _create_family_and_baby(db)

    fetched_baby = get_baby(db, created_baby.id)

    assert fetched_baby is not None
    assert fetched_baby.id == created_baby.id
    assert fetched_baby.name == created_baby.name

def test_get_baby_not_found(db: Session):
    baby = get_baby(db, 99999)
    assert baby is None

import pytest
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session

from app.services.ai_summary import build_daily_prompt
from app.models.baby import Baby
from app.models.family import Family
from app.models.user import User
from app.models.feeding import Feeding, FeedingType
from app.models.sleep import Sleep
from app.models.diaper import Diaper, DiaperType
from app.models.growth import Growth

# JST timezone definition
JST = timezone(timedelta(hours=9))

@pytest.fixture
def test_data(db: Session):
    # Setup Family, User, Baby
    family = Family(name="Test Family", invite_code="testcode123")
    db.add(family)
    db.commit()
    db.refresh(family)

    user = User(username="testuser", hashed_password="hashed_password", display_name="Test User")
    db.add(user)
    db.commit()
    db.refresh(user)

    baby = Baby(family_id=family.id, name="Test Baby", birthday=date(2023, 1, 1), gender="boy")
    db.add(baby)
    db.commit()
    db.refresh(baby)

    return {"family": family, "user": user, "baby": baby}

def test_build_daily_prompt_with_records(db: Session, test_data):
    baby = test_data["baby"]
    user = test_data["user"]
    target_date = date(2024, 1, 15)

    # 1. Feeding Record (10:00 JST)
    feeding_time = datetime(2024, 1, 15, 10, 0, 0, tzinfo=JST)
    feeding = Feeding(
        user_id=user.id,
        baby_id=baby.id,
        feeding_time=feeding_time,
        feeding_type=FeedingType.BOTTLE,
        amount_ml=120,
        notes="Drank well"
    )
    db.add(feeding)

    # 2. Sleep Record (13:00 - 15:00 JST)
    sleep_start = datetime(2024, 1, 15, 13, 0, 0, tzinfo=JST)
    sleep_end = datetime(2024, 1, 15, 15, 0, 0, tzinfo=JST)
    sleep = Sleep(
        user_id=user.id,
        baby_id=baby.id,
        start_time=sleep_start,
        end_time=sleep_end,
        notes="Nap"
    )
    db.add(sleep)

    # 3. Diaper Record (16:00 JST)
    change_time = datetime(2024, 1, 15, 16, 0, 0, tzinfo=JST)
    diaper = Diaper(
        user_id=user.id,
        baby_id=baby.id,
        change_time=change_time,
        diaper_type=DiaperType.WET,
        notes="Heavy"
    )
    db.add(diaper)

    # 4. Growth Record (Same Date)
    growth = Growth(
        user_id=user.id,
        baby_id=baby.id,
        date=target_date,
        weight=8000,
        height=70.5,
        head_circumference=45.0,
        notes="Checkup"
    )
    db.add(growth)

    db.commit()

    # Execute
    prompt, total_records, records_text = build_daily_prompt(db, baby.id, baby.name, target_date)

    # Assertions
    assert total_records == 4

    # Check if records_text contains key information
    assert "Test Babyちゃんの2024年01月15日の育児記録です。" in records_text

    # Feeding check
    assert "【授乳】1回" in records_text
    assert "10:00 ミルク 120ml" in records_text
    assert "メモ: Drank well" in records_text

    # Sleep check
    assert "【睡眠】1回" in records_text
    assert "13:00〜15:00（120分）" in records_text
    assert "メモ: Nap" in records_text

    # Diaper check
    assert "【おむつ】1回" in records_text
    assert "16:00 おしっこ" in records_text
    assert "メモ: Heavy" in records_text

    # Growth check
    assert "【成長記録】" in records_text
    assert "体重 8.000kg" in records_text
    assert "身長 70.5cm" in records_text
    assert "頭囲 45.0cm" in records_text

    # Prompt wrapper check
    assert "以下は赤ちゃんの育児記録です。" in prompt
    assert records_text in prompt

def test_build_daily_prompt_no_records(db: Session, test_data):
    baby = test_data["baby"]
    target_date = date(2024, 2, 20) # A date with no records

    # Execute
    prompt, total_records, records_text = build_daily_prompt(db, baby.id, baby.name, target_date)

    # Assertions
    assert total_records == 0
    assert "Test Babyちゃんの2024年02月20日の育児記録です。" in records_text
    assert "【授乳】" not in records_text
    assert "【睡眠】" not in records_text
    assert "【おむつ】" not in records_text
    assert "【成長記録】" not in records_text

def test_build_daily_prompt_timezone(db: Session, test_data):
    baby = test_data["baby"]
    user = test_data["user"]
    target_date = date(2024, 3, 10)

    # Records that SHOULD be included

    # Start of day (00:00:00 JST)
    t1 = datetime(2024, 3, 10, 0, 0, 0, tzinfo=JST)
    db.add(Feeding(
        user_id=user.id, baby_id=baby.id, feeding_time=t1,
        feeding_type=FeedingType.BREAST, amount_ml=None
    ))

    # End of day (23:59:59 JST)
    t2 = datetime(2024, 3, 10, 23, 59, 59, tzinfo=JST)
    db.add(Feeding(
        user_id=user.id, baby_id=baby.id, feeding_time=t2,
        feeding_type=FeedingType.BREAST, amount_ml=None
    ))

    # Records that SHOULD NOT be included

    # Previous day end (23:59:59 JST of previous day)
    t_prev = datetime(2024, 3, 9, 23, 59, 59, tzinfo=JST)
    db.add(Feeding(
        user_id=user.id, baby_id=baby.id, feeding_time=t_prev,
        feeding_type=FeedingType.BREAST, amount_ml=None
    ))

    # Next day start (00:00:00 JST of next day)
    t_next = datetime(2024, 3, 11, 0, 0, 0, tzinfo=JST)
    db.add(Feeding(
        user_id=user.id, baby_id=baby.id, feeding_time=t_next,
        feeding_type=FeedingType.BREAST, amount_ml=None
    ))

    db.commit()

    # Execute
    prompt, total_records, records_text = build_daily_prompt(db, baby.id, baby.name, target_date)

    # Assertions
    assert total_records == 2

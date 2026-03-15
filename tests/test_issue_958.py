import pytest
from sqlalchemy.exc import IntegrityError
from datetime import date
from app.models.ai_summary import DailySummary

def test_daily_summary_soft_delete_unique_constraint(client, auth_client, db):
    # Setup: Create baby
    c = auth_client()
    resp = c.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    assert resp.status_code in (200, 201)
    baby_id = resp.json()["id"]

    summary_date = date(2026, 3, 15)

    # 1. Create a DailySummary
    summary1 = DailySummary(
        baby_id=baby_id,
        summary_date=summary_date,
        generated_content="Original summary"
    )
    db.add(summary1)
    db.commit()

    # 2. Soft delete the first summary
    summary1.is_deleted = True
    db.commit()

    # 3. Create a new DailySummary for the same baby and date
    summary2 = DailySummary(
        baby_id=baby_id,
        summary_date=summary_date,
        generated_content="Re-generated summary"
    )
    db.add(summary2)
    
    # 4. Attempt to commit - this should succeed if the fix is applied.
    # Without the fix, it would raise an IntegrityError here.
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        pytest.fail(f"IntegrityError raised: DailySummary unique constraint violation on soft-deleted record: {e}")

    # Verify that the new record is the active one
    active_summaries = db.query(DailySummary).filter(
        DailySummary.baby_id == baby_id,
        DailySummary.summary_date == summary_date,
        DailySummary.is_deleted == False
    ).all()
    
    assert len(active_summaries) == 1
    assert active_summaries[0].generated_content == "Re-generated summary"

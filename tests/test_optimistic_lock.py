import pytest
import time
from fastapi.testclient import TestClient
from datetime import datetime, timezone, timedelta, date
from app.models.note import Note
from app.models.ai_summary import DailySummary

def test_note_optimistic_lock(client: TestClient, auth_client, db):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    # Create note
    resp = client.post(
        f"/api/babies/{baby_id}/notes",
        json={"content": "Initial Content", "note_time": datetime.now(timezone.utc).isoformat()}
    )
    assert resp.status_code == 201
    data = resp.json()
    note_id = data["id"]
    updated_at = data["updated_at"]

    time.sleep(1) # Ensure updated_at changes

    # 1. Update with correct updated_at
    patch_resp1 = client.patch(
        f"/api/notes/{note_id}",
        json={"content": "Updated Content 1", "updated_at": updated_at}
    )
    assert patch_resp1.status_code == 200
    new_updated_at = patch_resp1.json()["updated_at"]

    # 2. Update with old updated_at should fail with 409
    patch_resp2 = client.patch(
        f"/api/notes/{note_id}",
        json={"content": "Updated Content 2", "updated_at": updated_at}
    )
    assert patch_resp2.status_code == 409

    # 3. Update with the latest updated_at should succeed
    patch_resp3 = client.patch(
        f"/api/notes/{note_id}",
        json={"content": "Updated Content 3", "updated_at": new_updated_at}
    )
    assert patch_resp3.status_code == 200


def test_daily_summary_optimistic_lock(client: TestClient, auth_client, db):
    client = auth_client()
    user_res = client.get("/api/auth/me")
    user_id = user_res.json().get("id", 1)

    baby_res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    summary_date = date.today().isoformat()

    # Create DailySummary manually in DB since API triggers AI generation
    summary = DailySummary(
        baby_id=baby_id,
        user_id=user_id,
        summary_date=date.today(),
        generated_content="AI Generated Diary",
        is_edited=False,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    resp = client.get(f"/api/babies/{baby_id}/daily-summary/{summary_date}")
    assert resp.status_code == 200
    data = resp.json()
    updated_at = data["updated_at"]

    time.sleep(1) # Ensure updated_at changes

    # 1. Update with correct updated_at
    patch_resp1 = client.patch(
        f"/api/babies/{baby_id}/daily-summary/{summary_date}",
        json={"edited_content": "Manually Edited 1", "updated_at": updated_at}
    )
    assert patch_resp1.status_code == 200
    new_updated_at = patch_resp1.json()["updated_at"]

    # 2. Update with old updated_at should fail with 409
    patch_resp2 = client.patch(
        f"/api/babies/{baby_id}/daily-summary/{summary_date}",
        json={"edited_content": "Manually Edited 2", "updated_at": updated_at}
    )
    assert patch_resp2.status_code == 409

    # 3. Update with the latest updated_at should succeed
    patch_resp3 = client.patch(
        f"/api/babies/{baby_id}/daily-summary/{summary_date}",
        json={"edited_content": "Manually Edited 3", "updated_at": new_updated_at}
    )
    assert patch_resp3.status_code == 200

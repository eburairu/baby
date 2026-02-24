from fastapi.testclient import TestClient
from datetime import datetime
import pytest

def test_long_input_validation(client: TestClient):
    # 1. Register Family and User
    family_payload = {
        "name": "Test Family",
        "username": "testvalidator",
        "password": "StrongPassword123"
    }
    res = client.post("/api/auth/register/family", json=family_payload)
    assert res.status_code == 200, f"Register failed: {res.text}"
    family_data = res.json()

    # Login is handled by register/family setting the cookie, but let's explicit login to be sure
    login_payload = {
        "username": "testvalidator",
        "password": "StrongPassword123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"

    # 2. Create a Baby
    baby_payload = {
        "name": "Test Baby",
        "birthday": datetime.now().date().isoformat(),
        "gender": "boy"
    }
    # Try with trailing slash
    res = client.post("/api/babies/", json=baby_payload)
    assert res.status_code == 200, f"Create Baby failed: {res.status_code} {res.text}"
    baby_data = res.json()
    baby_id = baby_data["id"]

    # 3. Create a Feeding record with excessively long notes (3000 chars)
    long_notes = "a" * 3000
    feeding_payload = {
        "baby_id": baby_id,
        "feeding_time": datetime.now().isoformat(),
        "feeding_type": "BOTTLE",
        "amount_ml": 100,
        "notes": long_notes
    }

    # Feeding endpoint also likely needs trailing slash
    res = client.post("/api/feedings/", json=feeding_payload)

    # After the fix, this should be 422 Unprocessable Entity
    assert res.status_code == 422, f"Create Feeding did not fail as expected: {res.status_code} {res.text}"

    # 4. Create a Schedule with excessively long description
    long_description = "b" * 3000
    schedule_payload = {
        "baby_id": baby_id,
        "title": "Test Schedule",
        "description": long_description,
        "scheduled_time": datetime.now().isoformat()
    }
    # Schedule endpoint check
    res = client.post("/api/schedules/", json=schedule_payload)

    # After the fix, this should be 422 Unprocessable Entity
    assert res.status_code == 422, f"Create Schedule did not fail as expected: {res.status_code} {res.text}"

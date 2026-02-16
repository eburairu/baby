import pytest
from datetime import datetime, timezone

def test_create_and_get_schedule(auth_client):
    client = auth_client()
    # Create a baby
    res = client.post(
        "/api/babies/",
        json={"name": "太郎", "birthday": "2024-01-01", "gender": "boy"}
    )
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # Create a schedule
    scheduled_time = datetime.now(timezone.utc).isoformat()
    response = client.post(
        "/api/schedules/",
        json={
            "baby_id": baby_id,
            "title": "予防接種",
            "description": "BCGワクチン",
            "scheduled_time": scheduled_time,
            "is_completed": False
        }
    )
    assert response.status_code == 200
    schedule_id = response.json()["id"]
    assert response.json()["title"] == "予防接種"

    # Get schedules
    response = client.get(f"/api/schedules/?baby_id={baby_id}")
    assert response.status_code == 200
    schedules = response.json()
    assert len(schedules) >= 1
    assert any(s["id"] == schedule_id for s in schedules)

def test_delete_schedule(auth_client):
    client = auth_client()
    # Create a baby
    res = client.post("/api/babies/", json={"name": "太郎", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]

    # Create a schedule
    scheduled_time = datetime.now(timezone.utc).isoformat()
    res = client.post(
        "/api/schedules/",
        json={
            "baby_id": baby_id,
            "title": "削除用",
            "scheduled_time": scheduled_time
        }
    )
    schedule_id = res.json()["id"]

    # Delete the schedule
    response = client.delete(f"/api/schedules/{schedule_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Deleted"}

    # Verify it's gone
    response = client.get(f"/api/schedules/?baby_id={baby_id}")
    assert not any(s["id"] == schedule_id for s in response.json())

def test_schedule_unauthorized_access(auth_client):
    # User A creates a baby and a schedule
    client_a = auth_client(username="user_a", family_name="Family A")
    res = client_a.post("/api/babies/", json={"name": "Baby A", "birthday": "2024-01-01"})
    baby_a_id = res.json()["id"]

    scheduled_time = datetime.now(timezone.utc).isoformat()
    res = client_a.post(
        "/api/schedules/",
        json={
            "baby_id": baby_a_id,
            "title": "Secret Schedule",
            "scheduled_time": scheduled_time
        }
    )
    schedule_id = res.json()["id"]
    client_a.cookies.clear()

    # User B (different family) tries to access User A's schedule
    client_b = auth_client(username="user_b", family_name="Family B")

    # Try GET
    response = client_b.get(f"/api/schedules/?baby_id={baby_a_id}")
    assert response.status_code == 403

    # Try DELETE
    response = client_b.delete(f"/api/schedules/{schedule_id}")
    assert response.status_code == 403

def test_delete_non_existent_schedule(auth_client):
    client = auth_client()
    # Try to delete a schedule that doesn't exist
    response = client.delete("/api/schedules/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Schedule not found"

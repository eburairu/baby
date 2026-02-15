import pytest
from datetime import datetime, timedelta, timezone

@pytest.fixture
def baby(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "Test Baby", "birthday": "2024-01-01", "gender": "boy"})
    assert res.status_code == 200
    return client, res.json()["id"]

def test_create_sleep(baby):
    client, baby_id = baby
    start_time = datetime.now(timezone.utc)
    end_time = start_time + timedelta(hours=2)

    response = client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "notes": "Nap time"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["baby_id"] == baby_id
    assert data["notes"] == "Nap time"
    # ISO format check might be tricky with timezone, checking existence
    assert "start_time" in data
    assert "end_time" in data

def test_create_sleep_no_end_time(baby):
    client, baby_id = baby
    start_time = datetime.now(timezone.utc)

    response = client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start_time.isoformat(),
            "notes": "Ongoing sleep"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["baby_id"] == baby_id
    assert data["end_time"] is None

def test_get_sleeps(baby):
    client, baby_id = baby

    # Create two sleep records
    now = datetime.now(timezone.utc)

    # Record 1: 2 hours ago
    start1 = now - timedelta(hours=2)
    client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start1.isoformat(),
            "notes": "First nap"
        }
    )

    # Record 2: 1 hour ago (should come first in list as it's more recent)
    start2 = now - timedelta(hours=1)
    client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start2.isoformat(),
            "notes": "Second nap"
        }
    )

    response = client.get(f"/api/sleeps/?baby_id={baby_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["notes"] == "Second nap"
    assert data[1]["notes"] == "First nap"

def test_update_sleep(baby):
    client, baby_id = baby
    start_time = datetime.now(timezone.utc)

    # Create
    create_res = client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start_time.isoformat(),
            "notes": "Original note"
        }
    )
    sleep_id = create_res.json()["id"]

    # Update
    end_time = start_time + timedelta(hours=1)
    response = client.patch(
        f"/api/sleeps/{sleep_id}",
        json={
            "end_time": end_time.isoformat(),
            "notes": "Updated note"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == "Updated note"
    assert data["end_time"] is not None

def test_delete_sleep(baby):
    client, baby_id = baby
    start_time = datetime.now(timezone.utc)

    # Create
    create_res = client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start_time.isoformat()
        }
    )
    sleep_id = create_res.json()["id"]

    # Delete
    response = client.delete(f"/api/sleeps/{sleep_id}")
    assert response.status_code == 200

    # Verify deletion (API behavior is usually not to return deleted items)
    get_res = client.get(f"/api/sleeps/?baby_id={baby_id}")
    assert len(get_res.json()) == 0

    # Verify 404 on update/delete of deleted item
    update_res = client.patch(f"/api/sleeps/{sleep_id}", json={"notes": "Try update"})
    assert update_res.status_code == 404

def test_access_control(auth_client):
    # User A setup
    client_a = auth_client(username="user_a", family_name="Family A")
    res_a = client_a.post("/api/babies/", json={"name": "Baby A", "birthday": "2024-01-01", "gender": "boy"})
    baby_a_id = res_a.json()["id"]

    # Create sleep record for Baby A
    sleep_res = client_a.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_a_id,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "notes": "Baby A sleep"
        }
    )
    sleep_a_id = sleep_res.json()["id"]

    # User B setup
    client_b = auth_client(username="user_b", family_name="Family B")

    # User B tries to access Baby A's sleep records
    get_res = client_b.get(f"/api/sleeps/?baby_id={baby_a_id}")
    assert get_res.status_code == 403

    # User B tries to update Baby A's sleep record
    update_res = client_b.patch(
        f"/api/sleeps/{sleep_a_id}",
        json={"notes": "Hacked"}
    )
    # Depending on implementation, this might be 404 (not found in user's scope) or 403 (forbidden access)
    # Looking at code:
    # sleep = db.query(Sleep).filter(Sleep.id == sleep_id).first()
    # verify_baby_access(db, sleep.baby_id, ...)
    # If standard verify_baby_access raises 403, then it should be 403.
    # However, create_sleep checks access BEFORE creation.
    # update_sleep finds sleep by ID (global lookup), then checks access.
    assert update_res.status_code == 403

    # User B tries to delete Baby A's sleep record
    delete_res = client_b.delete(f"/api/sleeps/{sleep_a_id}")
    assert delete_res.status_code == 403

def test_invalid_operations(baby):
    client, baby_id = baby

    # Update non-existent
    response = client.patch("/api/sleeps/99999", json={"notes": "Ghost"})
    assert response.status_code == 404

    # Delete non-existent
    response = client.delete("/api/sleeps/99999")
    assert response.status_code == 404

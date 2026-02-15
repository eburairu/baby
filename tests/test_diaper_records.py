from datetime import datetime, timedelta
import pytest
from app.models.diaper import DiaperType

def test_diaper_crud(auth_client):
    client = auth_client()
    # 1. Create a baby first
    res = client.post("/api/babies/", json={"name": "Baby Diaper", "birthday": "2024-01-01", "gender": "boy"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # 2. Create Diaper Record
    change_time = datetime.now().isoformat()
    diaper_data = {
        "baby_id": baby_id,
        "change_time": change_time,
        "diaper_type": "WET",
        "notes": "First change"
    }
    res = client.post("/api/diapers/", json=diaper_data)
    assert res.status_code == 200
    data = res.json()
    assert data["baby_id"] == baby_id
    assert data["diaper_type"] == "WET"
    assert data["notes"] == "First change"
    diaper_id = data["id"]

    # 3. Get Diaper Records
    res = client.get(f"/api/diapers/?baby_id={baby_id}")
    assert res.status_code == 200
    records = res.json()
    assert len(records) == 1
    assert records[0]["id"] == diaper_id
    assert records[0]["diaper_type"] == "WET"

    # 4. Update Diaper Record
    update_data = {
        "diaper_type": "DIRTY",
        "notes": "Updated note"
    }
    res = client.put(f"/api/diapers/{diaper_id}", json=update_data)
    assert res.status_code == 200
    updated_data = res.json()
    assert updated_data["diaper_type"] == "DIRTY"
    assert updated_data["notes"] == "Updated note"

    # Verify update via GET
    res = client.get(f"/api/diapers/?baby_id={baby_id}")
    assert res.status_code == 200
    records = res.json()
    assert records[0]["diaper_type"] == "DIRTY"
    assert records[0]["notes"] == "Updated note"

    # 5. Delete Diaper Record
    res = client.delete(f"/api/diapers/{diaper_id}")
    assert res.status_code == 200

    # Verify deletion
    res = client.get(f"/api/diapers/?baby_id={baby_id}")
    assert res.status_code == 200
    assert len(res.json()) == 0

def test_diaper_list_ordering(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "Baby Order", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]

    # Create 3 records with different times
    base_time = datetime.now()
    times = [
        base_time - timedelta(hours=1),
        base_time,
        base_time - timedelta(hours=2)
    ]

    for t in times:
        client.post("/api/diapers/", json={
            "baby_id": baby_id,
            "change_time": t.isoformat(),
            "diaper_type": "WET"
        })

    res = client.get(f"/api/diapers/?baby_id={baby_id}")
    assert res.status_code == 200
    records = res.json()
    assert len(records) == 3

    # Should be ordered by change_time descending (newest first)
    # base_time (index 1 in times) > base_time - 1h (index 0) > base_time - 2h (index 2)
    # Expected order in response: times[1], times[0], times[2]

    t0 = datetime.fromisoformat(records[0]["change_time"])
    t1 = datetime.fromisoformat(records[1]["change_time"])
    t2 = datetime.fromisoformat(records[2]["change_time"])

    assert t0 > t1
    assert t1 > t2

def test_diaper_access_control(auth_client):
    # User A
    client_a = auth_client(username="user_a_diaper", family_name="Family A")
    res = client_a.post("/api/babies/", json={"name": "Baby A"})
    baby_a_id = res.json()["id"]

    # Create a diaper record for Baby A
    res = client_a.post("/api/diapers/", json={
        "baby_id": baby_a_id,
        "change_time": datetime.now().isoformat(),
        "diaper_type": "WET"
    })
    diaper_a_id = res.json()["id"]

    # Clear cookies to simulate logout
    client_a.cookies.clear()

    # User B (different family)
    client_b = auth_client(username="user_b_diaper", family_name="Family B")

    # 1. Try to GET diapers for Baby A
    res = client_b.get(f"/api/diapers/?baby_id={baby_a_id}")
    assert res.status_code == 403

    # 2. Try to POST diaper for Baby A
    res = client_b.post("/api/diapers/", json={
        "baby_id": baby_a_id,
        "change_time": datetime.now().isoformat(),
        "diaper_type": "WET"
    })
    assert res.status_code == 403

    # 3. Try to PUT diaper for Baby A
    res = client_b.put(f"/api/diapers/{diaper_a_id}", json={"notes": "Hacked"})
    # The current implementation might return 404 if it checks ownership before existence,
    # or 403 if it checks existence then ownership.
    # Let's check the implementation:
    # diaper = db.query(Diaper).filter(Diaper.id == diaper_id).first()
    # verify_baby_access(db, diaper.baby_id, ...)
    # So it should find it, then raise 403.
    assert res.status_code == 403

    # 4. Try to DELETE diaper for Baby A
    res = client_b.delete(f"/api/diapers/{diaper_a_id}")
    assert res.status_code == 403

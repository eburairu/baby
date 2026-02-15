import pytest
from datetime import date, timedelta

def test_create_growth_record(auth_client):
    client = auth_client()
    # Create baby first
    res = client.post("/api/babies/", json={"name": "Baby Growth", "birthday": "2024-01-01"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    # Create growth record
    growth_data = {
        "baby_id": baby_id,
        "date": "2024-02-01",
        "weight": 3500,
        "height": 50.5,
        "head_circumference": 33.0,
        "notes": "First month checkup"
    }
    response = client.post("/api/growths/", json=growth_data)
    assert response.status_code == 200
    data = response.json()
    assert data["baby_id"] == baby_id
    assert data["date"] == "2024-02-01"
    assert data["weight"] == 3500
    assert data["height"] == 50.5

def test_get_growth_records(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "Baby Growth Get", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]

    # Create 2 records
    date1 = "2024-02-01"
    date2 = "2024-03-01"

    client.post("/api/growths/", json={
        "baby_id": baby_id,
        "date": date1,
        "weight": 3500
    })
    client.post("/api/growths/", json={
        "baby_id": baby_id,
        "date": date2,
        "weight": 4200
    })

    # Get records
    response = client.get(f"/api/growths/?baby_id={baby_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Should be sorted by date desc
    assert data[0]["date"] == date2
    assert data[1]["date"] == date1

def test_update_growth_record(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "Baby Update", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]

    # Create record
    res_growth = client.post("/api/growths/", json={
        "baby_id": baby_id,
        "date": "2024-02-01",
        "weight": 3500
    })
    growth_id = res_growth.json()["id"]

    # Update record
    update_data = {"weight": 3600, "notes": "Updated weight"}
    response = client.put(f"/api/growths/{growth_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["weight"] == 3600
    assert data["notes"] == "Updated weight"
    # Verify persistence
    get_res = client.get(f"/api/growths/?baby_id={baby_id}")
    assert get_res.json()[0]["weight"] == 3600

def test_delete_growth_record(auth_client):
    client = auth_client()
    res = client.post("/api/babies/", json={"name": "Baby Delete", "birthday": "2024-01-01"})
    baby_id = res.json()["id"]

    # Create record
    res_growth = client.post("/api/growths/", json={
        "baby_id": baby_id,
        "date": "2024-02-01",
        "weight": 3500
    })
    growth_id = res_growth.json()["id"]

    # Delete record
    response = client.delete(f"/api/growths/{growth_id}")
    assert response.status_code == 200

    # Verify deleted
    get_res = client.get(f"/api/growths/?baby_id={baby_id}")
    assert len(get_res.json()) == 0

    # Delete again -> 404
    response = client.delete(f"/api/growths/{growth_id}")
    assert response.status_code == 404

def test_growth_access_control(auth_client):
    # User A
    client_a = auth_client(username="user_a_growth", family_name="Family A Growth")
    res = client_a.post("/api/babies/", json={"name": "Baby A"})
    baby_a_id = res.json()["id"]
    res_growth = client_a.post("/api/growths/", json={
        "baby_id": baby_a_id,
        "date": "2024-02-01",
        "weight": 3000
    })
    growth_a_id = res_growth.json()["id"]
    client_a.cookies.clear()

    # User B
    client_b = auth_client(username="user_b_growth", family_name="Family B Growth")

    # Try to GET User A's baby growth records
    # Note: verify_baby_access checks baby_id and family.
    # If baby belongs to another family, it returns 403.
    response = client_b.get(f"/api/growths/?baby_id={baby_a_id}")
    assert response.status_code == 403

    # Try to PUT User A's growth record
    # Note: update_growth first finds the growth record by ID (global query),
    # then calls verify_baby_access with growth.baby_id.
    response = client_b.put(f"/api/growths/{growth_a_id}", json={"weight": 4000})
    assert response.status_code == 403

    # Try to DELETE User A's growth record
    response = client_b.delete(f"/api/growths/{growth_a_id}")
    assert response.status_code == 403

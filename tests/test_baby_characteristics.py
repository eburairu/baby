from datetime import date

def test_create_baby_with_characteristics(auth_client):
    client = auth_client()
    
    # 1. Create baby with characteristics
    res = client.post(
        "/api/babies/",
        json={
            "name": "CharBaby",
            "birthday": "2025-01-01",
            "due_date": "2025-01-05",
            "characteristics": "Initial text"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "CharBaby"
    assert data["characteristics"] == "Initial text"
    baby_id = data["id"]
    
    # 2. Update characteristics
    res = client.patch(
        f"/api/babies/{baby_id}",
        json={
            "characteristics": "Updated text"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["characteristics"] == "Updated text"
    
    # 3. Verify get list returns characteristics
    res = client.get("/api/babies/")
    assert res.status_code == 200
    babies = res.json()
    target = next(b for b in babies if b["id"] == baby_id)
    assert target["characteristics"] == "Updated text"
    
def test_update_characteristics_partial(auth_client):
    client = auth_client(username="user2", password="password123", family_name="Fam2")
    
    # Create baby without characteristics
    res = client.post(
        "/api/babies/",
        json={"name": "Baby2", "birthday": "2025-02-01"}
    )
    baby_id = res.json()["id"]
    
    # Update only characteristics
    res = client.patch(
        f"/api/babies/{baby_id}",
        json={"characteristics": "New char"}
    )
    assert res.status_code == 200
    assert res.json()["characteristics"] == "New char"
    
    # Update something else, characteristics should remain
    res = client.patch(
        f"/api/babies/{baby_id}",
        json={"name": "Baby2Updated"}
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Baby2Updated"
    assert res.json()["characteristics"] == "New char"

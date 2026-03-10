import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from app.models.sleep import Sleep
from app.models.baby import Baby

def test_get_sleeps_missing_baby_id(client: TestClient, auth_client):
    client = auth_client()
    response = client.get("/api/sleeps/")
    # Query parameter baby_id is required
    assert response.status_code == 422

def test_get_sleeps_unauthorized(client: TestClient):
    response = client.get("/api/sleeps/?baby_id=1")
    assert response.status_code == 401

def test_create_sleep_success(client: TestClient, auth_client):
    client = auth_client()
    
    # Create a baby first
    baby_res = client.post("/api/babies/", json={"name": "Sleepy Baby", "gender": "girl"})
    baby_id = baby_res.json()["id"]
    
    start_time = datetime.now(timezone.utc).isoformat()
    response = client.post(
        "/api/sleeps/",
        json={
            "baby_id": baby_id,
            "start_time": start_time,
            "notes": "お昼寝開始"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["baby_id"] == baby_id
    assert data["notes"] == "お昼寝開始"
    assert data["end_time"] is None
    assert "recorded_by_display_name" in data

def test_get_sleeps_list(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Sleepy Baby", "gender": "girl"})
    baby_id = baby_res.json()["id"]
    
    # Create a record
    client.post(
        "/api/sleeps/",
        json={"baby_id": baby_id, "start_time": datetime.now(timezone.utc).isoformat()}
    )
    
    response = client.get(f"/api/sleeps/?baby_id={baby_id}")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_access_other_family_baby(client: TestClient, auth_client):
    # Family A creates a baby
    client_a = auth_client(username="user_a", family_name="Family A")
    baby_res = client_a.post("/api/babies/", json={"name": "Baby A", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    # Family B tries to access Baby A
    client_b = auth_client(username="user_b", family_name="Family B")
    
    # GET
    resp_get = client_b.get(f"/api/sleeps/?baby_id={baby_id}")
    assert resp_get.status_code == 403
    
    # POST
    resp_post = client_b.post(
        "/api/sleeps/",
        json={"baby_id": baby_id, "start_time": datetime.now(timezone.utc).isoformat()}
    )
    assert resp_post.status_code == 403

def test_update_sleep(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Sleepy Baby", "gender": "girl"})
    baby_id = baby_res.json()["id"]
    
    # Start sleep
    start_resp = client.post(
        "/api/sleeps/",
        json={"baby_id": baby_id, "start_time": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()}
    )
    sleep_id = start_resp.json()["id"]
    
    # Stop sleep (update end_time)
    end_time = datetime.now(timezone.utc).isoformat()
    response = client.patch(
        f"/api/sleeps/{sleep_id}",
        json={"end_time": end_time, "notes": "スッキリ起きた"}
    )
    assert response.status_code == 200
    assert response.json()["notes"] == "スッキリ起きた"
    assert response.json()["end_time"] is not None

def test_delete_sleep(client: TestClient, auth_client, db):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Sleepy Baby", "gender": "girl"})
    baby_id = baby_res.json()["id"]
    
    resp = client.post(
        "/api/sleeps/",
        json={"baby_id": baby_id, "start_time": datetime.now(timezone.utc).isoformat()}
    )
    sleep_id = resp.json()["id"]
    
    response = client.delete(f"/api/sleeps/{sleep_id}")
    assert response.status_code == 200
    
    # Verify deletion
    record = db.query(Sleep).filter(Sleep.id == sleep_id).execution_options(include_deleted=True).first()
    assert record is not None
    assert record.is_deleted is True

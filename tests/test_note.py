import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from app.models.note import Note
from app.models.baby import Baby

def test_create_note(client: TestClient, auth_client):
    # Register and login
    client = auth_client()
    
    # Need a baby
    baby_res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    response = client.post(
        f"/api/babies/{baby_id}/notes",
        json={"content": "はじめての笑い！", "note_time": datetime.now().isoformat()}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "はじめての笑い！"
    assert data["baby_id"] == baby_id

def test_get_notes(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    # Create a note
    client.post(
        f"/api/babies/{baby_id}/notes",
        json={"content": "Note 1", "note_time": datetime.now().isoformat()}
    )
    
    response = client.get(f"/api/babies/{baby_id}/notes")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_update_note(client: TestClient, auth_client):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    # Create
    resp = client.post(
        f"/api/babies/{baby_id}/notes",
        json={"content": "Old Content", "note_time": datetime.now().isoformat()}
    )
    note_id = resp.json()["id"]
    
    # Update
    response = client.patch(
        f"/api/notes/{note_id}",
        json={"content": "New Content"}
    )
    assert response.status_code == 200
    assert response.json()["content"] == "New Content"

def test_delete_note(client: TestClient, auth_client, db):
    client = auth_client()
    baby_res = client.post("/api/babies/", json={"name": "Test Baby", "gender": "boy"})
    baby_id = baby_res.json()["id"]
    
    # Create
    resp = client.post(
        f"/api/babies/{baby_id}/notes",
        json={"content": "Delete Me", "note_time": datetime.now().isoformat()}
    )
    note_id = resp.json()["id"]
    
    # Delete
    response = client.delete(f"/api/notes/{note_id}")
    assert response.status_code == 200
    
    # Verify
    assert db.query(Note).filter(Note.id == note_id).first() is None

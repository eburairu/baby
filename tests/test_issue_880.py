import pytest
from fastapi import status
from datetime import date
from app.models.baby import Baby
from app.models.milestone import Milestone
from app.models.family import FamilyUser

def setup_test_data(auth_client, db, username):
    client = auth_client(username=username, password="password123")
    response_me = client.get("/api/auth/me")
    user_id = response_me.json()["id"]
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    
    baby = Baby(family_id=fu.family_id, name=f"Baby {username}", birthday=date(2026, 1, 1))
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return client, baby

def test_duplicate_milestone_prevention(auth_client, db):
    client, baby = setup_test_data(auth_client, db, "testuser880")
    
    # 2. Create first milestone
    payload = {
        "milestone_type": "rolling_over",
        "title": "寝返りできた！",
        "achieved_date": "2026-03-01",
        "notes": "First time"
    }
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json=payload)
    assert response.status_code == status.HTTP_201_CREATED

    # 3. Try to create duplicate milestone (should fail with 409 Conflict)
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json=payload)
    # This is expected to FAIL currently (returns 201 before fix)
    assert response.status_code == status.HTTP_409_CONFLICT

def test_custom_milestone_duplicates_allowed(auth_client, db):
    client, baby = setup_test_data(auth_client, db, "testuser880b")
    
    # Create first custom milestone
    payload1 = {
        "milestone_type": "custom",
        "title": "Custom 1",
        "achieved_date": "2026-03-01"
    }
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json=payload1)
    assert response.status_code == status.HTTP_201_CREATED

    # Create second custom milestone (should be ALLOWED)
    payload2 = {
        "milestone_type": "custom",
        "title": "Custom 2",
        "achieved_date": "2026-03-02"
    }
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json=payload2)
    assert response.status_code == status.HTTP_201_CREATED

def test_duplicate_milestone_allowed_if_deleted(auth_client, db):
    client, baby = setup_test_data(auth_client, db, "testuser880c")
    
    # 1. Create milestone
    payload = {
        "milestone_type": "sitting_up",
        "title": "お座り",
        "achieved_date": "2026-03-01"
    }
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json=payload)
    m_id = response.json()["id"]
    
    # 2. Delete it
    response = client.delete(f"/api/milestones/{m_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # 3. Create same milestone again (should be ALLOWED because previous one is deleted)
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json=payload)
    assert response.status_code == status.HTTP_201_CREATED

def test_update_milestone_duplicate_prevention(auth_client, db):
    client, baby = setup_test_data(auth_client, db, "testuser880d")
    
    # 1. Create two milestones of different types
    client.post(f"/api/milestones/?baby_id={baby.id}", json={
        "milestone_type": "rolling_over",
        "title": "寝返り",
        "achieved_date": "2026-03-01"
    })
    resp2 = client.post(f"/api/milestones/?baby_id={baby.id}", json={
        "milestone_type": "sitting_up",
        "title": "お座り",
        "achieved_date": "2026-04-01"
    })
    m2_id = resp2.json()["id"]

    # 2. Try to update the second one to the type of the first one
    response = client.patch(f"/api/milestones/{m2_id}", json={
        "milestone_type": "rolling_over"
    })
    assert response.status_code == status.HTTP_409_CONFLICT

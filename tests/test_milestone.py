import pytest
from datetime import date
from app.models.baby import Baby
from app.models.family import FamilyUser

def setup_test_data(auth_client, db):
    client = auth_client(username="milestoneuser", password="password123")
    response_me = client.get("/api/auth/me")
    user_id = response_me.json()["id"]
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    
    baby = Baby(family_id=fu.family_id, name="Milestone Baby", birthday=date(2026, 1, 1))
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return client, baby, user_id

def test_milestone_crud(auth_client, db):
    client, baby, _ = setup_test_data(auth_client, db)
    
    # Create
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json={
        "milestone_type": "rolling_over",
        "title": "寝返り",
        "achieved_date": "2026-03-01",
        "image_urls": ["http://example.com/img1.jpg", "http://example.com/img2.jpg"],
        "notes": "頑張りました！"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "寝返り"
    assert len(data["image_urls"]) == 2
    m_id = data["id"]
    
    # Get all
    response = client.get(f"/api/milestones/?baby_id={baby.id}")
    assert response.status_code == 200
    assert any(m["id"] == m_id for m in response.json())
    
    # Update
    response = client.patch(f"/api/milestones/{m_id}", json={
        "notes": "修正したメモ"
    })
    assert response.status_code == 200
    assert response.json()["notes"] == "修正したメモ"
    
    # Delete
    response = client.delete(f"/api/milestones/{m_id}")
    assert response.status_code == 204
    
    # Check deleted
    response = client.get(f"/api/milestones/?baby_id={baby.id}")
    assert not any(m["id"] == m_id for m in response.json())
    
    # DB確認
    from app.models.milestone import Milestone
    record = db.query(Milestone).filter(Milestone.id == m_id).execution_options(include_deleted=True).first()
    assert record is not None
    assert record.is_deleted is True

def test_milestone_timeline(auth_client, db):
    client, baby, _ = setup_test_data(auth_client, db)
    
    # Add milestone at 2 months (2026-03-01)
    client.post(f"/api/milestones/?baby_id={baby.id}", json={
        "milestone_type": "rolling_over",
        "title": "寝返り",
        "achieved_date": "2026-03-01",
        "image_urls": []
    })
    
    # Add milestone at 4 months (2026-05-01)
    client.post(f"/api/milestones/?baby_id={baby.id}", json={
        "milestone_type": "sitting_up",
        "title": "お座り",
        "achieved_date": "2026-05-01",
        "image_urls": []
    })
    
    response = client.get(f"/api/milestones/timeline?baby_id={baby.id}")
    assert response.status_code == 200
    data = response.json()
    # data: [{"month_age": 2, "milestones": [...]}, {"month_age": 4, "milestones": [...]}]
    assert len(data) == 2
    assert data[0]["month_age"] == 2
    assert data[1]["month_age"] == 4

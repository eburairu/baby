import pytest
from datetime import date
from app.models.vaccination import VaccinationStatus
from app.models.baby import Baby
from app.models.family import FamilyUser

def setup_test_data(auth_client, db):
    client = auth_client(username="vaxuser", password="password123")
    response_me = client.get("/api/auth/me")
    user_id = response_me.json()["id"]
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    
    baby = Baby(family_id=fu.family_id, name="Vax Baby", birthday=date(2026, 1, 1))
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return client, baby, user_id

def test_generate_vaccinations(auth_client, db):
    client, baby, _ = setup_test_data(auth_client, db)
    
    # Generate
    response = client.post(f"/api/vaccinations/generate?baby_id={baby.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["vaccine_name"] == "ロタウイルス"
    assert data[0]["dose_number"] == 1
    assert data[0]["status"] == VaccinationStatus.SCHEDULED

def test_get_vaccinations(auth_client, db):
    client, baby, _ = setup_test_data(auth_client, db)
    
    # Add one manually
    client.post(f"/api/vaccinations/?baby_id={baby.id}", json={
        "vaccine_name": "Test Vaccine",
        "dose_number": 1,
        "scheduled_date": "2026-03-01"
    })
    
    response = client.get(f"/api/vaccinations/?baby_id={baby.id}")
    assert response.status_code == 200
    data = response.json()
    assert any(v["vaccine_name"] == "Test Vaccine" for v in data)

def test_update_vaccination_status(auth_client, db):
    client, baby, _ = setup_test_data(auth_client, db)
    
    # Create
    resp = client.post(f"/api/vaccinations/?baby_id={baby.id}", json={
        "vaccine_name": "Status Test",
        "dose_number": 1,
        "scheduled_date": "2026-03-01"
    })
    v_id = resp.json()["id"]
    
    # Update to completed
    response = client.patch(f"/api/vaccinations/{v_id}", json={
        "status": VaccinationStatus.COMPLETED,
        "completed_date": "2026-03-02",
        "lot_number": "LOT123"
    })
    assert response.status_code == 200
    assert response.json()["status"] == VaccinationStatus.COMPLETED
    assert response.json()["lot_number"] == "LOT123"

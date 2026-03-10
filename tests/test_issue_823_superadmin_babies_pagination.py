import pytest
from fastapi import status
from datetime import date
from app.models.baby import Baby
from app.models.family import Family
from app.models.user import User

def test_superadmin_babies_pagination(auth_client, db):
    # 1. Register and login as a user
    client = auth_client(username="adminuser_823", password="password123")
    
    # 2. Make the current user a SuperAdmin directly in the DB
    admin_user = db.query(User).filter(User.username == "adminuser_823").first()
    admin_user.is_superadmin = True
    db.commit()

    # Create a family
    family = Family(name="Test Family for SuperAdmin Pagination", invite_code="SUPER123")
    db.add(family)
    db.commit()
    db.refresh(family)
    
    # Create 5 babies
    for i in range(5):
        baby = Baby(
            family_id=family.id,
            name=f"Admin Baby {i}",
            birthday=date(2023, 1, 1),
            gender="unknown"
        )
        db.add(baby)
    db.commit()

    # Fetch without pagination
    response = client.get("/api/babies/")
    assert response.status_code == status.HTTP_200_OK
    all_babies = response.json()
    total_babies = len(all_babies)
    assert total_babies >= 5
    
    # Fetch with limit=2
    response = client.get("/api/babies/?limit=2")
    assert response.status_code == status.HTTP_200_OK
    paginated_babies = response.json()
    assert len(paginated_babies) == 2
    
    # Fetch with limit=2, offset=2
    response = client.get("/api/babies/?limit=2&offset=2")
    assert response.status_code == status.HTTP_200_OK
    offset_babies = response.json()
    assert len(offset_babies) == 2
    assert paginated_babies[0]["id"] != offset_babies[0]["id"]

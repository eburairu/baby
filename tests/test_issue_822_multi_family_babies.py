from sqlalchemy.orm import Session
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby

def test_get_babies_multi_family(auth_client, db: Session):
    # Create the main user and family (Family 1)
    client = auth_client(username="user1", password="password123", family_name="Family 1")
    
    # Create a baby in Family 1
    res = client.post("/api/babies/", json={"name": "Baby 1", "birthday": "2024-01-01"})
    assert res.status_code == 200
    baby1_id = res.json()["id"]

    # Now let's create a second family manually in DB
    import uuid
    new_family = Family(name="Family 2", invite_code=str(uuid.uuid4())[:8])
    db.add(new_family)
    db.commit()
    db.refresh(new_family)

    # Get the user
    user1 = db.query(User).filter(User.username == "user1").first()

    # Add user1 to Family 2 as well
    new_family_user = FamilyUser(family_id=new_family.id, user_id=user1.id, role=UserRole.ADMIN)
    db.add(new_family_user)
    db.commit()

    from datetime import date
    # Create a baby in Family 2
    baby2 = Baby(name="Baby 2", birthday=date(2024, 2, 1), family_id=new_family.id)
    db.add(baby2)
    db.commit()
    db.refresh(baby2)

    # Now call GET /api/babies/ with user1
    res = client.get("/api/babies/")
    assert res.status_code == 200
    babies = res.json()
    
    # User 1 should see both Baby 1 and Baby 2
    assert len(babies) == 2
    baby_names = [b["name"] for b in babies]
    assert "Baby 1" in baby_names
    assert "Baby 2" in baby_names

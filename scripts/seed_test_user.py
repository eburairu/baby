import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.services.auth import get_password_hash
from app.models.base import Base

load_dotenv()

def seed_test_user():
    # Ensure tables exist (they should, but just in case)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        username = os.getenv("TEST_USER_USERNAME", "testuser")
        password = os.getenv("TEST_USER_PASSWORD", "password123")
        
        # Check if user already exists
        user = db.query(User).filter(User.username == username).first()
        if user:
            print(f"User {username} already exists.")
            return

        # Create a family for the test user
        family = Family(name="Test Family", invite_code="TEST1234")
        db.add(family)
        db.flush()

        # Create the test user
        hashed_password = get_password_hash(password)
        new_user = User(username=username, hashed_password=hashed_password)
        db.add(new_user)
        db.flush()

        # Link user to family
        family_user = FamilyUser(family_id=family.id, user_id=new_user.id, role="admin")
        db.add(family_user)
        
        db.commit()
        print(f"Successfully created test user: {username}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding test user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_user()

import sys
import os
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.models.base import Base
from app.models.baby import Baby
from app.models.family import Family
from app.schemas.baby import BabyUpdate
from app.services.baby import update_baby

# Setup in-memory DB for testing
engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def verify_manual_update():
    print("--- Verifying Manual Characteristics Update ---")
    
    # 1. Setup Data
    family = Family(name="TestFamily", invite_code="INVITE123")
    db.add(family)
    db.commit()
    
    baby = Baby(name="TestBaby", birthday=date.today(), family_id=family.id, characteristics="Initial AI characteristics")
    db.add(baby)
    db.commit()
    db.refresh(baby)
    
    print(f"Initial Characteristics: {baby.characteristics}")
    assert baby.characteristics == "Initial AI characteristics"
    
    # 2. Update via Service (Simulating API Patch)
    print("Updating characteristics manually...")
    update_data = BabyUpdate(characteristics="Updated by parent manually")
    updated_baby = update_baby(db, baby, update_data)
    
    print(f"Updated Characteristics: {updated_baby.characteristics}")
    assert updated_baby.characteristics == "Updated by parent manually"
    
    # 3. Verify persistence
    db.expire_all()
    baby_refetched = db.query(Baby).filter(Baby.id == baby.id).first()
    assert baby_refetched.characteristics == "Updated by parent manually"
    
    print("SUCCESS: Manual update persisted correctly.")

if __name__ == "__main__":
    verify_manual_update()

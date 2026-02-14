
import sys
import os
from datetime import date, datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.models.base import Base
from app.models.baby import Baby
from app.models.user import User
from app.models.diaper import Diaper, DiaperType
from app.services.ai_summary import build_daily_prompt

from app.models.family import Family

# Setup in-memory DB for testing
engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def verify_prompt_contains_notes():
    # 1. Create dummy data
    user = User(username="testuser", hashed_password="pw", display_name="Test User")
    db.add(user)
    db.commit()

    family = Family(name="TestFamily", invite_code="INVITE123")
    db.add(family)
    db.commit()
    
    baby = Baby(name="TestBaby", birthday=date.today(), family_id=family.id)
    # baby.users.append(user) # Baby doesn't have users relationship directly in the code I saw, it has family.
    # checking Baby model again: `family = relationship("Family", backref="babies")`
    # User has `family_users`. Family has `users` via FamilyUser likely.
    # But for this test, we just need a baby with an ID.
    db.add(baby)
    db.commit()
    
    target_date = date(2025, 1, 1) # Arbitrary date
    
    # Create a diaper record with notes
    note_content = "うんちが緩め"
    diaper = Diaper(
        user_id=user.id,
        baby_id=baby.id,
        change_time=datetime(2025, 1, 1, 10, 0, 0),
        diaper_type=DiaperType.DIRTY,
        notes=note_content
    )
    db.add(diaper)
    db.commit()
    
    # 2. Generate prompt
    prompt, count = build_daily_prompt(db, baby.id, baby.name, target_date)
    
    print("----- Generated Prompt Start -----")
    print(prompt)
    print("----- Generated Prompt End -----")
    
    # 3. Verify
    if note_content in prompt:
        print(f"\nSUCCESS: Note '{note_content}' was found in the prompt.")
    else:
        print(f"\nFAILURE: Note '{note_content}' was NOT found in the prompt.")
        sys.exit(1)

if __name__ == "__main__":
    verify_prompt_contains_notes()

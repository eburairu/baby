
import sys
import os
from datetime import date, datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.models.base import Base
from app.models.baby import Baby
from app.models.user import User
from app.models.family import Family
from app.models.diaper import Diaper, DiaperType
from app.services.ai_summary import generate_daily_summary

# Setup in-memory DB for testing
# Note: Use file-based sqlite to persist between calls if needed, but in-memory is fine for single run
engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def verify_characteristics_update():
    # 1. Setup Data
    user = User(username="testuser", hashed_password="pw", display_name="Test User")
    db.add(user)
    
    family = Family(name="TestFamily", invite_code="INVITE123")
    db.add(family)
    db.commit()
    
    baby = Baby(name="TestBaby", birthday=date.today(), family_id=family.id)
    db.add(baby)
    db.commit()
    
    # 2. Add records (Day 1: Loose Stool)
    target_date = date(2025, 2, 1)
    
    # Add multiple loose stool records to make it a "trend"
    for i in range(3):
        diaper = Diaper(
            user_id=user.id,
            baby_id=baby.id,
            change_time=datetime(2025, 2, 1, 10 + i, 0, 0),
            diaper_type=DiaperType.DIRTY,
            notes="うんちが緩い気がする"
        )
        db.add(diaper)
    db.commit()
    
    # Mocking OpenAI for testing without API key
    from unittest.mock import MagicMock, patch
    
    mock_client = MagicMock()
    # Mocking the response chain: client.chat.completions.create().choices[0].message.content
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "これはテスト用の育児日誌です。うんちが緩いことが記録されています。"
    
    # We need to handle two calls: one for summary, one for characteristics update
    # 1st call: Summary generation
    # 2nd call: Characteristics update (should return updated characteristics)
    
    def side_effect(*args, **kwargs):
        messages = kwargs.get('messages', [])
        content = ""
        if "育児日誌" in messages[0]['content'] or "アシスタント" in messages[0]['content']:
             # This heuristic might be weak, checking the role or prompt content is better
             if "育児日誌" in messages[-1]['content']: # prompt is in user content
                 return mock_response # Return summary
             if "特徴・傾向" in messages[-1]['content']: # update prompt contains this
                 update_response = MagicMock()
                 update_response.choices[0].message.content = "- 最近うんちが緩い傾向がある"
                 return update_response
        return mock_response

    mock_client.chat.completions.create.side_effect = side_effect
    
    # Patch get_llm_client to return our mock
    with patch('app.services.ai_summary.get_llm_client', return_value=(mock_client, "gpt-test")):
        print("--- Generating Summary for Day 1 (Mocked) ---")
        try:
            summary, model = generate_daily_summary(db, baby.id, baby.name, target_date)
            print(f"Generated Summary: {summary}")
        except Exception as e:
            print(f"Error generating summary: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        
    # 3. Check Characteristics Update
    db.refresh(baby)
    print(f"Updated Characteristics: {baby.characteristics}")
    
    if baby.characteristics and "緩い" in baby.characteristics:
        print("\nSUCCESS: Characteristics updated with 'loose stool' trend.")
    else:
        print("\nFAILURE: Characteristics NOT updated or keyword missing.")
        # Failing strictly might be hard due to LLM variance, but let's see.
    
if __name__ == "__main__":
    verify_characteristics_update()

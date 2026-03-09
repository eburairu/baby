import os
import sys
import logging
from datetime import datetime

# Allow importing from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import UserSession

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def cleanup_expired_sessions(db: Session) -> int:
    """
    Delete expired UserSession records from the database.
    Returns the number of deleted records.
    """
    now = datetime.now()
    
    deleted_count = db.query(UserSession).filter(UserSession.expires_at < now).delete(synchronize_session=False)
    return deleted_count

def main():
    logger.info("Starting cleanup of expired user sessions...")
    db = SessionLocal()
    try:
        deleted_count = cleanup_expired_sessions(db)
        db.commit()
        logger.info(f"Successfully deleted {deleted_count} expired sessions.")
    except Exception as e:
        logger.error(f"Error during session cleanup: {e}")
        db.rollback()
    finally:
        db.close()
    logger.info("Session cleanup finished.")

if __name__ == "__main__":
    main()

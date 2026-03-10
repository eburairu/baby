from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.utils.audit import cleanup_old_audit_logs
import logging

logger = logging.getLogger(__name__)

def run_cleanup_job():
    """
    Background job to clean up old audit logs.
    """
    logger.info("Starting scheduled audit log cleanup job...")
    db = SessionLocal()
    try:
        deleted_count = cleanup_old_audit_logs(db, days=90)
        db.commit()
        logger.info(f"Scheduled audit log cleanup finished. Deleted {deleted_count} logs.")
    except Exception as e:
        logger.error(f"Error during scheduled audit log cleanup: {e}")
        db.rollback()
    finally:
        db.close()

def setup_scheduler():
    """
    Initialize and start the background scheduler.
    """
    scheduler = BackgroundScheduler()
    
    # Run everyday at 03:00 AM (local time, which is JST in Render)
    trigger = CronTrigger(hour=3, minute=0)
    
    scheduler.add_job(
        run_cleanup_job,
        trigger=trigger,
        id="audit_log_cleanup",
        name="Cleanup old audit logs (90 days)",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Background scheduler started.")
    return scheduler

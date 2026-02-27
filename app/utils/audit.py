from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Optional, Any
import json
import logging

logger = logging.getLogger(__name__)

def log_event(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None,
    commit: bool = True
):
    """
    Record an event in the audit_logs table.
    """
    try:
        # Convert details to JSON string if it's a dict or list
        if details is not None and not isinstance(details, str):
            details_str = json.dumps(details)
        else:
            details_str = details

        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            details=details_str,
            ip_address=ip_address
        )
        db.add(audit_entry)
        if commit:
            db.commit()
        else:
            db.flush()
    except Exception as e:
        # Don't fail the main request if audit logging fails, just log it
        logger.error(f"Failed to record audit log: {e}")
        if commit:
            db.rollback()

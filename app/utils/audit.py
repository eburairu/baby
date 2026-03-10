from sqlalchemy.orm import Session
from fastapi import Request
from app.models.audit_log import AuditLog
from app.database import SessionLocal
from typing import Optional, Any
import json
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

def get_client_ip(request: Request) -> Optional[str]:
    """
    Safely extract the client IP address from the request.
    Handles X-Forwarded-For headers from proxies like Render.
    """
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        # X-Forwarded-For can be a comma-separated list of IPs.
        # The first one is typically the original client IP.
        client_ip = x_forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip
            
    # Fallback to standard client host
    if request.client and request.client.host:
        return request.client.host
        
    return None

def log_event(
    action: str,
    user_id: Optional[int] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None
):
    """
    Record an event in the audit_logs table.
    Decoupled from the request's DB session, creating a new session within the function.
    """
    db = SessionLocal()
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
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
    finally:
        db.close()

def cleanup_old_audit_logs(db: Session, days: int = 90) -> int:
    """
    Delete audit logs older than the specified number of days.
    Returns the number of deleted records.
    """
    try:
        threshold_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        deleted_count = db.query(AuditLog).filter(AuditLog.created_at < threshold_date).delete(synchronize_session=False)
        return deleted_count
    except Exception as e:
        logger.error(f"Failed to cleanup old audit logs: {e}")
        return 0

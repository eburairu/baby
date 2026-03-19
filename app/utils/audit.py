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

    Uses the rightmost IP in X-Forwarded-For to prevent spoofing:
    clients can inject arbitrary values at the start of the header,
    but the trusted proxy (Render) always appends the real client IP
    at the end. Set TRUSTED_PROXY_COUNT to the number of proxy hops
    (default 1) to pick the correct entry from the right.
    """
    import os
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        ips = [ip.strip() for ip in x_forwarded_for.split(",") if ip.strip()]
        if ips:
            try:
                trusted_proxy_count = int(os.environ.get("TRUSTED_PROXY_COUNT", "1"))
            except ValueError:
                trusted_proxy_count = 1
            # The client IP is at index -(trusted_proxy_count) from the right.
            # With 1 trusted proxy, the last entry was appended by that proxy
            # and reflects the real client.
            idx = max(0, len(ips) - trusted_proxy_count)
            return ips[idx]

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
        logger.error("Failed to record audit log: %s", e)
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
        logger.error("Failed to cleanup old audit logs: %s", e)
        return 0

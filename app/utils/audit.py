from sqlalchemy.orm import Session
from fastapi import Request
from app.models.audit_log import AuditLog
from typing import Optional, Any
import json
import logging

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
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None,
    commit: bool = True
):
    """
    Record an event in the audit_logs table.
    Best-effort implementation using nested transactions to avoid breaking the main transaction.
    """
    try:
        # Use nested transaction to isolate audit log operation
        with db.begin_nested():
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
            db.flush() # Ensure it's valid within the nested transaction

        if commit:
            db.commit()
    except Exception as e:
        # Don't fail the main request if audit logging fails, just log it
        logger.error(f"Failed to record audit log: {e}")
        # When commit=True, we own the transaction and should ensure it's rolled back
        # if the top-level commit or nested operation failed outside the block.
        # But since begin_nested handles its own rollback on exception, 
        # we only need to rollback the main transaction if we were supposed to commit it.
        if commit:
            try:
                db.rollback()
            except Exception:
                pass

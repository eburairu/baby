import pytest
from app.utils.audit import log_event
from app.models.audit_log import AuditLog

def test_log_event_creates_own_session(db):
    """
    Test that log_event creates its own database session and saves the audit log.
    It should not require a db session parameter.
    """
    # Verify the table is empty
    initial_count = db.query(AuditLog).count()
    
    # Call log_event without passing a db session
    log_event(
        action="TEST_BACKGROUND_LOG",
        user_id=None,
        details={"test": "data"},
        ip_address="127.0.0.1"
    )
    
    # The log should be inserted into the database
    new_count = db.query(AuditLog).count()
    assert new_count == initial_count + 1
    
    log = db.query(AuditLog).filter(AuditLog.action == "TEST_BACKGROUND_LOG").first()
    assert log is not None
    assert log.ip_address == "127.0.0.1"
    assert "test" in log.details

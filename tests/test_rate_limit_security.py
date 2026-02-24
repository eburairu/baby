import pytest
import time
from app.utils.rate_limit import RateLimiter

def test_rate_limiter_security_fix():
    """
    Test that exceeding max_size removes old entries intelligently
    instead of clearing the entire history (DoS vulnerability).
    """
    # Create a limiter with a very small max_size for testing
    limiter = RateLimiter(requests_limit=5, time_window=60, max_size=3)

    # 1. Fill with valid users
    users = ["user1", "user2", "user3"]
    for user in users:
        limiter.check(user)

    assert len(limiter.requests) == 3
    assert "user1" in limiter.requests
    assert "user2" in limiter.requests
    assert "user3" in limiter.requests

    # 2. Add attacker request to exceed max_size
    # Current implementation: Evicts oldest (user1) to keep size at 3
    limiter.check("attacker_ip_1")
    assert len(limiter.requests) == 3

    # Verify user1 is gone (FIFO eviction)
    assert "user1" not in limiter.requests, "Oldest user should be evicted"

    # Verify others remain (DoS fix confirmed!)
    assert "user2" in limiter.requests, "User2 should preserved"
    assert "user3" in limiter.requests, "User3 should preserved"
    assert "attacker_ip_1" in limiter.requests

    # 3. Add another request
    limiter.check("attacker_ip_2")
    assert len(limiter.requests) == 3

    # Verify user2 is gone now
    assert "user2" not in limiter.requests
    assert "user3" in limiter.requests
    assert "attacker_ip_2" in limiter.requests

def test_rate_limiter_expiry_cleanup():
    """Test that expired entries are cleaned up properly"""
    limiter = RateLimiter(requests_limit=5, time_window=1, max_size=3)

    limiter.check("user1")
    time.sleep(1.1)

    # Force cleanup by adding new entries up to limit
    limiter.check("user2")
    limiter.check("user3")
    limiter.check("user4") # size 3, user1 should be gone due to expiry or eviction

    assert "user1" not in limiter.requests

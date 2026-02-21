import pytest
from fastapi import Request
from app.utils.rate_limit import RateLimiter
from app.routers.auth import login_limiter

@pytest.mark.enable_rate_limit
def test_rate_limit_enforcement(client):
    """
    Verify that the login endpoint enforces rate limiting.
    The limit is set to 5 requests per 60 seconds.
    """
    # The fixture handles clearing the rate limiter state.

    # Attempt 5 logins (within limit)
    for i in range(5):
        res = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpassword"}
        )
        # Should be 401 Unauthorized (failed login)
        assert res.status_code == 401, f"Attempt {i+1} failed with status {res.status_code}"

    # 6th attempt should be blocked
    res = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "wrongpassword"}
    )
    assert res.status_code == 429
    assert res.json()["detail"] == "Too many login attempts. Please try again later."

@pytest.mark.anyio
async def test_rate_limit_with_none_client():
    """
    Verify that the rate limiter doesn't crash if request.client is None.
    This can happen in certain ASGI environments or with TestClient (Starlette 0.35+).
    """
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/auth/login",
        "headers": [],
    }
    request = Request(scope=scope)
    
    limiter = RateLimiter(requests_limit=5, time_window=60)
    # Should not raise AttributeError: 'NoneType' object has no attribute 'host'
    await limiter(request)

import pytest
from fastapi import Request, HTTPException
from app.utils.rate_limit import RateLimiter

@pytest.mark.enable_rate_limit
def test_rate_limit_enforcement(client):
    """
    Verify that the login endpoint enforces rate limiting.
    """
    for _ in range(5):
        res = client.post("/api/auth/login", json={"username": "t", "password": "p"})
        assert res.status_code == 401
    
    res = client.post("/api/auth/login", json={"username": "t", "password": "p"})
    assert res.status_code == 429

@pytest.mark.enable_rate_limit
@pytest.mark.anyio
async def test_rate_limit_with_client_host():
    """
    Verify that the rate limiter correctly uses request.client.host.
    """
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/auth/login",
        "headers": [],
        "client": ("203.0.113.195", 12345)
    }
    request = Request(scope=scope)
    
    assert request.client is not None
    assert request.client.host == "203.0.113.195"
    
    limiter = RateLimiter(requests_limit=1, time_window=60)
    
    # 1st attempt - should succeed
    await limiter(request)
    
    # Verify internal state
    assert len(limiter.requests["203.0.113.195"]) == 1
    
    # 2nd attempt with same client host - should fail
    with pytest.raises(HTTPException) as excinfo:
        await limiter(request)
    assert excinfo.value.status_code == 429

@pytest.mark.enable_rate_limit
@pytest.mark.anyio
async def test_rate_limit_with_none_client():
    """
    Verify that the rate limiter doesn't crash if request.client is None.
    """
    scope = {"type": "http", "method": "POST", "path": "/", "headers": []}
    request = Request(scope=scope)
    limiter = RateLimiter(requests_limit=5)
    await limiter(request)
    assert len(limiter.requests["unknown"]) == 1

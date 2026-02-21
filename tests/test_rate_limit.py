import pytest
from fastapi import Request
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
def test_rate_limit_with_x_forwarded_for(client):
    """
    Verify that the rate limiter uses the X-Forwarded-For header if present.
    """
    headers = {"X-Forwarded-For": "203.0.113.195"}
    for _ in range(5):
        res = client.post("/api/auth/login", json={"username": "t", "password": "p"}, headers=headers)
        assert res.status_code == 401
    
    res = client.post("/api/auth/login", json={"username": "t", "password": "p"}, headers=headers)
    assert res.status_code == 429

@pytest.mark.enable_rate_limit
def test_rate_limit_independent_ips(client):
    """
    Verify that different X-Forwarded-For IPs have independent rate limits.
    """
    # IP 1 reaches limit
    headers1 = {"X-Forwarded-For": "1.1.1.1"}
    for _ in range(5):
        client.post("/api/auth/login", json={"username": "t", "password": "p"}, headers=headers1)
    assert client.post("/api/auth/login", json={"username": "t", "password": "p"}, headers=headers1).status_code == 429

    # IP 2 should still be 401
    headers2 = {"X-Forwarded-For": "2.2.2.2"}
    assert client.post("/api/auth/login", json={"username": "t", "password": "p"}, headers=headers2).status_code == 401

@pytest.mark.anyio
async def test_rate_limit_with_none_client():
    """
    Verify that the rate limiter doesn't crash if request.client is None.
    """
    scope = {"type": "http", "method": "POST", "path": "/", "headers": []}
    request = Request(scope=scope)
    limiter = RateLimiter(requests_limit=5)
    await limiter(request)

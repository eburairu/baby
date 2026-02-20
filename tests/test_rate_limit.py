import pytest
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

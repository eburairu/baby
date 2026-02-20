from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_security_headers():
    response = client.get("/api/health")
    assert response.status_code == 200

    headers = response.headers

    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert headers.get("Strict-Transport-Security") == "max-age=31536000; includeSubDomains"

    csp = headers.get("Content-Security-Policy")
    assert csp is not None
    assert "default-src 'self'" in csp
    assert "script-src 'self' 'unsafe-inline' 'unsafe-eval'" in csp
    assert "img-src 'self' data: https:" in csp

    # Permissions Policy
    permissions = headers.get("Permissions-Policy")
    assert permissions is not None
    assert "camera=()" in permissions
    assert "microphone=()" in permissions
    assert "geolocation=()" in permissions
    assert "browsing-topics=()" in permissions

    # Cache Control for API endpoints
    assert headers.get("Cache-Control") == "no-store"

def test_security_headers_non_api():
    """Verify that non-API endpoints do not get the no-store Cache-Control header."""
    response = client.get("/robots.txt") # Random non-api path

    # Permissions Policy should be present everywhere
    assert response.headers.get("Permissions-Policy") is not None

    # Cache-Control should NOT be 'no-store' for non-API routes
    cache_control = response.headers.get("Cache-Control")
    if cache_control:
        assert "no-store" not in cache_control

import os
import importlib
import pytest
from fastapi.testclient import TestClient

def test_cookie_secure_default_is_true():
    # Ensure COOKIE_SECURE is not set in environment
    if "COOKIE_SECURE" in os.environ:
        del os.environ["COOKIE_SECURE"]

    # Reload the module to pick up the default value
    import app.routers.auth
    importlib.reload(app.routers.auth)

    from app.routers.auth import COOKIE_SECURE
    # Now it should be True by default
    assert COOKIE_SECURE is True

def test_cookie_secure_can_be_false():
    # Set COOKIE_SECURE to "false" in environment
    os.environ["COOKIE_SECURE"] = "false"

    # Reload the module
    import app.routers.auth
    importlib.reload(app.routers.auth)

    from app.routers.auth import COOKIE_SECURE
    assert COOKIE_SECURE is False

    # Cleanup
    del os.environ["COOKIE_SECURE"]

def test_cookie_secure_header_is_present(client):
    # We need to make sure the app uses the updated COOKIE_SECURE
    # Since 'client' might have already initialized the app, we might need to reload.
    # But in a typical pytest setup, the client is created per test or session.

    # Let's ensure COOKIE_SECURE is True for this test
    if "COOKIE_SECURE" in os.environ:
        del os.environ["COOKIE_SECURE"]
    import app.routers.auth
    importlib.reload(app.routers.auth)

    response = client.post(
        "/api/auth/register/family",
        json={
            "name": "Security Family",
            "username": "security_user_2",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    set_cookie = response.headers.get("set-cookie")
    assert "secure" in set_cookie.lower()

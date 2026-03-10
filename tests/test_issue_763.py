import pytest
from unittest.mock import patch
from app.schemas.auth import LoginRequest
from app.models.user import User

def test_login_uses_async_verify(client, db):
    # Register user first
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Async Family",
            "username": "asyncuser",
            "password": "password123"
        }
    )
    client.cookies.clear()
    
    with patch('app.routers.auth.verify_password_async') as mock_verify:
        # Need to make mock return True to pass authentication, but wait, it's async!
        from unittest.mock import AsyncMock
        mock_verify.side_effect = AsyncMock(return_value=True)
        
        response = client.post(
            "/api/auth/login",
            json={
                "username": "asyncuser",
                "password": "password123"
            }
        )
        # Even if login fails or succeeds, mock_verify should have been called
        mock_verify.assert_called()

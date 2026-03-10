from app.dependencies import get_db
from fastapi.testclient import TestClient
from app.main import app

def test_unhandled_exception():
    """
    Simulate an unhandled exception to verify the global exception handler.
    """
    # Define a dependency override that raises an exception
    def override_get_db_raise():
        raise Exception("Simulated unexpected error")

    # Apply the override
    app.dependency_overrides[get_db] = override_get_db_raise

    try:
        # Initialize TestClient with raise_server_exceptions=False
        with TestClient(app, raise_server_exceptions=False) as client:
            # Call an endpoint that uses the get_db dependency
            response = client.post("/api/auth/login", json={"username": "test", "password": "password"})

            # Check that the status code is 500
            assert response.status_code == 500

            # Check that the response body is secure (no stack trace or specific error message)
            data = response.json()
            assert data == {"detail": "Internal Server Error"}

            # Ensure the sensitive error message is NOT in the response
            assert "Simulated unexpected error" not in response.text

    finally:
        # Clean up the override
        del app.dependency_overrides[get_db]

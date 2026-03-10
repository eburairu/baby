import pytest
from unittest.mock import MagicMock
from app.routers.upload import upload_limiter

@pytest.fixture
def mock_upload_limiter():
    """Reset the upload limiter before each test."""
    upload_limiter.requests.clear()
    yield
    upload_limiter.requests.clear()

@pytest.fixture
def mock_r2_client(monkeypatch):
    """Mock R2/S3 client to avoid actual uploads."""
    mock_client = MagicMock()
    # put_object returns None on success
    mock_client.put_object.return_value = {}

    def get_mock_client():
        return mock_client

    monkeypatch.setattr("app.routers.upload._get_r2_client", get_mock_client)
    monkeypatch.setenv("R2_ACCOUNT_ID", "dummy")
    monkeypatch.setenv("R2_ACCESS_KEY_ID", "dummy")
    monkeypatch.setenv("R2_SECRET_ACCESS_KEY", "dummy")
    monkeypatch.setenv("R2_BUCKET_NAME", "dummy-bucket")
    monkeypatch.setenv("R2_PUBLIC_ENDPOINT", "https://dummy.r2.cloudflarestorage.com")
    return mock_client

def test_upload_rate_limit(client, mock_upload_limiter, mock_r2_client):
    # 1. Register and login
    # Registration might fail due to rate limiting if run repeatedly without clearing
    # But conftest clears DB for each test function
    res = client.post("/api/auth/register/family", json={
        "username": "limit_user",
        "password": "password123",
        "name": "Limit Family"
    })
    assert res.status_code == 200

    # Login to get token in cookies
    res = client.post("/api/auth/login", json={
        "username": "limit_user",
        "password": "password123"
    })
    assert res.status_code == 200

    # 2. Upload 10 images (limit is 10)
    # Magic bytes for PNG
    png_content = b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A" + b"\x00" * 10

    for i in range(10):
        res = client.post(
            "/api/upload/image",
            files={"file": ("test.png", png_content, "image/png")}
        )
        assert res.status_code == 200, f"Upload {i+1} failed: {res.text}"

    # 3. 11th upload should fail with 429
    res = client.post(
        "/api/upload/image",
        files={"file": ("test.png", png_content, "image/png")}
    )
    assert res.status_code == 429
    assert "Too many upload attempts" in res.json()["detail"]

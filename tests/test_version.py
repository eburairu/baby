import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock, MagicMock
import httpx

client = TestClient(app)

@pytest.mark.anyio
async def test_get_version_success():
    # GitHub API のモックデータ
    mock_release_data = {
        "tag_name": "v1.2.3",
        "body": "Fixed some bugs.",
        "published_at": "2024-02-19T00:00:00Z",
        "html_url": "https://github.com/eburairu/baby/releases/v1.2.3"
    }

    # httpx.AsyncClient をモック
    with patch("httpx.AsyncClient") as MockClient:
        mock_instance = MockClient.return_value
        # async with のための __aenter__
        mock_instance.__aenter__.return_value = mock_instance
        
        # client.get() は await されるので、AsyncMock にする
        # その await 結果として「レスポンスオブジェクトのモック」を返す
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_release_data
        
        mock_instance.get = AsyncMock(return_value=mock_response)

        # キャッシュをクリア
        from app.routers import version
        version._cache = {}

        response = client.get("/api/version")
        
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "1.2.3"

@pytest.mark.anyio
async def test_get_version_api_failure():
    # APIエラー時の挙動
    with patch("httpx.AsyncClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.__aenter__.return_value = mock_instance
        
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_instance.get = AsyncMock(return_value=mock_response)

        from app.routers import version
        version._cache = {}

        response = client.get("/api/version")
        
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "unknown"

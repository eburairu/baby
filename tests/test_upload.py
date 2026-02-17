import pytest
from botocore.exceptions import ClientError
from unittest.mock import MagicMock, patch

def test_upload_image_r2_failure(auth_client):
    """
    R2アップロードが失敗した場合、500エラーが返されることをテストする
    """
    # Create a mock client that raises ClientError
    mock_s3_client = MagicMock()
    error_response = {'Error': {'Code': 'InternalError', 'Message': 'Something went wrong'}}
    mock_s3_client.put_object.side_effect = ClientError(error_response, 'PutObject')

    # Mock _get_r2_client to return the mock client
    # Note: We patch where it is defined since it is imported and used there
    with patch("app.routers.upload._get_r2_client", return_value=mock_s3_client):
        client = auth_client()

        # Prepare a dummy file for upload
        # Simulating a file upload
        files = {'file': ('test_image.jpg', b'fake image content', 'image/jpeg')}

        response = client.post("/api/upload/image", files=files)

        assert response.status_code == 500
        data = response.json()
        # Verify the error details are propagated
        assert "InternalError" in data["detail"]
        assert "Something went wrong" in data["detail"]

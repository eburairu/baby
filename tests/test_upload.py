import pytest
from botocore.exceptions import ClientError
from unittest.mock import MagicMock, patch

def test_upload_image_r2_failure(auth_client):
    """
    R2アップロードが失敗した場合、500エラーが返されるが、詳細なエラーメッセージは隠蔽されることをテストする
    """
    # Create a mock client that raises ClientError
    mock_s3_client = MagicMock()
    error_response = {'Error': {'Code': 'InternalError', 'Message': 'Something went wrong'}}
    mock_s3_client.put_object.side_effect = ClientError(error_response, 'PutObject')

    # Mock _get_r2_client to return the mock client
    with patch("app.routers.upload._get_r2_client", return_value=mock_s3_client):
        client = auth_client()

        # マジックバイト検証を通過するために、有効なJPEGヘッダーを付与
        files = {'file': ('test_image.jpg', b'\xFF\xD8\xFFfake image content', 'image/jpeg')}

        response = client.post("/api/upload/image", files=files)

        assert response.status_code == 500
        data = response.json()

        # Verify the error details are HIDDEN
        # 旧仕様: assert "InternalError" in data["detail"]
        assert data["detail"] == "画像のアップロードに失敗しました。"
        assert "InternalError" not in data["detail"]


def test_upload_image_invalid_magic_bytes(auth_client):
    """
    マジックバイトが無効な場合、400エラーが返されることをテストする
    """
    client = auth_client()

    # 拡張子はjpgだが中身はテキスト（マジックバイトなし）
    files = {'file': ('test_image.jpg', b'This is definitely not an image', 'image/jpeg')}

    response = client.post("/api/upload/image", files=files)

    assert response.status_code == 400
    assert "無効な画像ファイル形式です" in response.json()["detail"]

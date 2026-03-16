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


def test_upload_image_extension_override(auth_client):
    """
    拡張子が偽装されている場合でも、マジックバイトに基づいて正しい拡張子とContent-Typeが設定されることをテストする
    """
    # Mock S3 client
    mock_s3_client = MagicMock()

    with patch("app.routers.upload._get_r2_client", return_value=mock_s3_client):
        client = auth_client()

        # Content is JPEG, but filename is .php. Content-Type is image/jpeg to pass initial check.
        files = {'file': ('malicious.php', b'\xFF\xD8\xFFfake image content', 'image/jpeg')}

        response = client.post("/api/upload/image", files=files)

        assert response.status_code == 200
        data = response.json()

        # Verify that the filename in the response has .jpg extension
        assert data["filename"].endswith(".jpg")
        assert not data["filename"].endswith(".php")

        # Verify that put_object was called with correct ContentType and Key
        mock_s3_client.put_object.assert_called_once()
        call_kwargs = mock_s3_client.put_object.call_args[1]

        # Even if user sent image/jpeg, we want to ensure our code explicitly sets it based on detection
        assert call_kwargs["ContentType"] == "image/jpeg"
        assert call_kwargs["Key"].endswith(".jpg")


def test_upload_image_unsupported_image_type(auth_client):
    """
    TIFFなどは画像だが、現時点ではサポートされていないため、400エラーが返されることをテストする
    """
    client = auth_client()

    # TIFF magic bytes: II* (49 49 2A 00)
    tiff_content = b"\x49\x49\x2A\x00" + b"fake tiff content"
    files = {'file': ('test.tif', tiff_content, 'image/tiff')}

    response = client.post("/api/upload/image", files=files)

    assert response.status_code == 400
    assert "サポートされていない画像形式です" in response.json()["detail"]


def test_upload_image_valid_webp(auth_client):
    """
    有効な WebP ファイルが正しくアップロードされることをテストする
    """
    mock_s3_client = MagicMock()

    with patch("app.routers.upload._get_r2_client", return_value=mock_s3_client):
        client = auth_client()

        # WebP magic bytes: RIFF....WEBP
        webp_content = b"RIFF" + b"\x00\x00\x00\x00" + b"WEBP" + b"VP8 "
        files = {'file': ('test.webp', webp_content, 'image/webp')}

        response = client.post("/api/upload/image", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["filename"].endswith(".webp")

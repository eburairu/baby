import pytest
from unittest.mock import MagicMock, patch

def test_upload_image_unsupported_image_type(auth_client):
    """
    TIFFなどは画像だが、現時点ではサポートされていないため、400エラーが返されることをテストする
    """
    client = auth_client()
    
    # TIFF magic bytes: II* (49 49 2A 00) or MM* (4D 4D 00 2A)
    tiff_content = b"\x49\x49\x2A\x00" + b"fake tiff content"
    files = {'file': ('test.tif', tiff_content, 'image/tiff')}
    
    response = client.post("/api/upload/image", files=files)
    
    # 現在の実装では 400 エラーになるはず（許可されていない形式）
    assert response.status_code == 400
    assert "サポートされていない画像形式です" in response.json()["detail"]

def test_upload_image_malicious_script_as_jpg(auth_client):
    """
    拡張子は .jpg だが、中身が PHP スクリプトの場合（マジックバイトなし）、400エラーになることをテストする
    """
    client = auth_client()
    
    # 中身は単なるテキスト（PHP）
    malicious_content = b"<?php phpinfo(); ?>"
    files = {'file': ('fake.jpg', malicious_content, 'image/jpeg')}
    
    response = client.post("/api/upload/image", files=files)
    
    assert response.status_code == 400
    assert "無効な画像ファイル形式です" in response.json()["detail"]

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

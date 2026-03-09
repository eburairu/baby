import os
import boto3
from botocore.exceptions import ClientError
from typing import List, Optional
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

def _get_s3_client():
    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
    if not account_id or not access_key or not secret_key:
        return None
    
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
    )

def generate_presigned_url(object_key: str, expiration: int = 3600) -> Optional[str]:
    """オブジェクトキーから署名付きURLを生成する。"""
    client = _get_s3_client()
    if not client:
        # 環境変数が設定されていない場合は、元のキーがURLならそのまま、そうでなければNoneを返す
        if object_key.startswith("http"):
            return object_key
        return None

    bucket_name = os.getenv("R2_BUCKET_NAME", "baby-app-images")
    try:
        url = client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': object_key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        logger.error(f"Error generating presigned URL for {object_key}: {e}")
        return None

def extract_object_key(url_or_key: str) -> str:
    """URLまたはキーからオブジェクトキー（ファイル名）を抽出する。"""
    if not url_or_key.startswith("http"):
        return url_or_key
    
    parsed_url = urlparse(url_or_key)
    # パスの最後の部分をキーとして扱う（ディレクトリ構造がある場合は要調整）
    # 現状の実装ではフラットに保存されているため、path.lstrip('/') で十分
    return parsed_url.path.lstrip('/')

def sign_image_urls(image_urls: List[str]) -> List[str]:
    """画像URL（またはキー）のリストを署名付きURLのリストに変換する。"""
    if not image_urls:
        return []
    
    signed_urls = []
    for item in image_urls:
        key = extract_object_key(item)
        signed_url = generate_presigned_url(key)
        if signed_url:
            signed_urls.append(signed_url)
        else:
            # フォールバックとして元の値を入れる（キーがそのまま返る可能性があるが、エラーログは出ている）
            signed_urls.append(item)
    return signed_urls

from starlette.concurrency import run_in_threadpool
import os
import uuid
import logging
import filetype
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError

from app.dependencies import get_db, get_current_user, verify_write_access
from app.models.user import User
from app.utils.rate_limit import RateLimiter
from app.core import constants
from app.utils.s3 import generate_presigned_url
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Limit upload attempts to 10 per 60 seconds per user
upload_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_UPLOAD_REQUESTS,
    time_window=constants.RATE_LIMIT_UPLOAD_WINDOW,
    error_message="Too many upload attempts. Please try again later.",
)


class UploadResponse(BaseModel):
    public_url: str  # 署名付きURLを返す（名前は互換性のために保持）
    filename: str


def _get_r2_client():
    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
    if not account_id or not access_key or not secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ストレージサービスが設定されていません。",
        )
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
    )


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """画像をバックエンド経由で R2 にアップロードする。"""
    # Enforce rate limiting per user
    upload_limiter.check(f"user_{current_user.id}")

    await run_in_threadpool(verify_write_access, db, current_user.id)

    # Check Content-Type header as a preliminary filter, but do not rely on it
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="画像ファイルのみアップロードできます。",
        )

    # メモリ枯渇（DoS）を防ぐため、ファイルをチャンクごとに読み込んでサイズを検証する
    content_bytearray = bytearray()
    while True:
        chunk = await file.read(1024 * 1024)  # 1MB chunk
        if not chunk:
            break
        content_bytearray.extend(chunk)
        if len(content_bytearray) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ファイルサイズが大きすぎます（上限 5MB）。",
            )
    content = bytes(content_bytearray)

    # Validate magic bytes and determine correct MIME type and extension
    # This prevents users from uploading malicious files (e.g., HTML/PHP) with fake extensions
    kind = filetype.guess(content)
    if not kind or not kind.mime.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効な画像ファイル形式です。",
        )

    # 許可される画像形式を制限（JPEG, PNG, GIF, WEBP）
    # TIFFなどは画像として検知されるが、Webでは一般的に使用されないため制限する
    allowed_mimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if kind.mime not in allowed_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="サポートされていない画像形式です（JPEG, PNG, GIF, WEBP のみ対応）。",
        )

    detected_mime_type = kind.mime
    # filetype.extension はドットなし（例: 'jpg'）
    # .jpeg の場合は互換性のために .jpg に正規化する
    if kind.extension == "jpeg":
        detected_extension = ".jpg"
    else:
        detected_extension = f".{kind.extension}"

    # Use detected extension instead of trusting user input
    object_key = f"{uuid.uuid4()}{detected_extension}"

    bucket_name = os.getenv("R2_BUCKET_NAME", "baby-app-images")

    def _do_upload():
        client = _get_r2_client()
        client.put_object(
            Bucket=bucket_name,
            Key=object_key,
            Body=content,
            ContentType=detected_mime_type,  # Use detected MIME type
        )

    try:
        await run_in_threadpool(_do_upload)
    except ClientError as e:
        logger.error("R2 upload failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="画像のアップロードに失敗しました。",
        )

    # 署名付きURLを生成（デフォルト1時間）
    signed_url = await run_in_threadpool(generate_presigned_url, object_key)
    if not signed_url:
        # フォールバック（通常は起こらないはずだが、設定ミスなどの場合）
        public_endpoint = os.getenv("R2_PUBLIC_ENDPOINT", "")
        signed_url = f"{public_endpoint.rstrip('/')}/{object_key}"

    return UploadResponse(public_url=signed_url, filename=object_key)

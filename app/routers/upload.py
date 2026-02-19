import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError

from app.dependencies import get_db, get_current_user, verify_write_access
from app.models.user import User
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


class UploadResponse(BaseModel):
    public_url: str
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
    verify_write_access(db, current_user.id)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="画像ファイルのみアップロードできます。",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ファイルサイズが大きすぎます（上限 5MB）。",
        )

    # Validate magic bytes
    # JPEG: FF D8 FF
    # PNG: 89 50 4E 47 0D 0A 1A 0A
    # GIF: 47 49 46 38
    # WebP: RIFF ... WEBP
    if not (
        content.startswith(b"\xFF\xD8\xFF")
        or content.startswith(b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A")
        or content.startswith(b"\x47\x49\x46\x38")
        or (content.startswith(b"RIFF") and len(content) >= 12 and content[8:12] == b"WEBP")
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効な画像ファイル形式です。",
        )

    original_ext = os.path.splitext(file.filename or "")[1].lower() or ".webp"
    object_key = f"{uuid.uuid4()}{original_ext}"

    bucket_name = os.getenv("R2_BUCKET_NAME", "baby-app-images")
    public_endpoint = os.getenv("R2_PUBLIC_ENDPOINT", "")

    try:
        client = _get_r2_client()
        client.put_object(
            Bucket=bucket_name,
            Key=object_key,
            Body=content,
            ContentType=file.content_type,
        )
    except ClientError as e:
        logger.error("R2 upload failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="画像のアップロードに失敗しました。",
        )

    public_url = f"{public_endpoint.rstrip('/')}/{object_key}"

    return UploadResponse(public_url=public_url, filename=object_key)

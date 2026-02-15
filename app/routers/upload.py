import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError

from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/upload", tags=["upload"])


class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str


class PresignedUrlResponse(BaseModel):
    upload_url: str
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


@router.post("/presigned", response_model=PresignedUrlResponse)
def create_presigned_url(
    body: PresignedUrlRequest,
    current_user: User = Depends(get_current_user),
):
    """画像アップロード用の署名付きURLを発行する。"""
    if not body.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="画像ファイルのみアップロードできます。",
        )

    # ファイル拡張子を取得（なければ .webp）
    original_ext = os.path.splitext(body.filename)[1].lower() or ".webp"
    object_key = f"{uuid.uuid4()}{original_ext}"

    bucket_name = os.getenv("R2_BUCKET_NAME", "baby-app-images")
    public_endpoint = os.getenv("R2_PUBLIC_ENDPOINT", "")

    try:
        client = _get_r2_client()
        upload_url = client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_key,
            },
            ExpiresIn=3600,
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="署名付きURLの生成に失敗しました。",
        )

    public_url = f"{public_endpoint.rstrip('/')}/{object_key}"

    return PresignedUrlResponse(
        upload_url=upload_url,
        public_url=public_url,
        filename=object_key,
    )

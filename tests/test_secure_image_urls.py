import pytest
from datetime import date
from unittest.mock import patch, MagicMock
from app.models.baby import Baby
from app.models.family import FamilyUser
from app.models.milestone import Milestone
from app.utils.s3 import extract_object_key


def test_extract_object_key_from_r2_presigned_url():
    """R2のpresigned URL（bucket名がパスに含まれる形式）からオブジェクトキーを正しく抽出できること。"""
    # R2 presigned URLの形式: https://<account>.r2.cloudflarestorage.com/<bucket>/<key>?signature...
    presigned = "https://abc123.r2.cloudflarestorage.com/baby-app-images/550e8400.jpg?X-Amz-Algorithm=AWS4"
    assert extract_object_key(presigned) == "550e8400.jpg"


def test_extract_object_key_from_public_domain_url():
    """カスタムドメインのURL（bucket名がパスに含まれない形式）からオブジェクトキーを正しく抽出できること。"""
    public = "https://pub.example.com/550e8400.jpg"
    assert extract_object_key(public) == "550e8400.jpg"


def test_extract_object_key_passthrough_for_plain_key():
    """オブジェクトキーをそのまま渡した場合はそのまま返ること。"""
    key = "550e8400.jpg"
    assert extract_object_key(key) == "550e8400.jpg"

def setup_test_data(auth_client, db):
    client = auth_client(username="secureuser", password="password123")
    response_me = client.get("/api/auth/me")
    user_id = response_me.json()["id"]
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    
    baby = Baby(family_id=fu.family_id, name="Secure Baby", birthday=date(2026, 1, 1))
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return client, baby, user_id

@patch("app.utils.s3._get_s3_client")
def test_secure_milestone_image_urls(mock_get_s3, auth_client, db):
    # Mock S3 client and presigned URL generation
    mock_client = MagicMock()
    mock_get_s3.return_value = mock_client
    mock_client.generate_presigned_url.side_effect = lambda operation, Params, ExpiresIn: f"https://signed-url.r2.dev/{Params['Key']}?signature=test"

    client, baby, _ = setup_test_data(auth_client, db)
    
    # 1. Create a Milestone with a full URL
    # Backend should extract the key "uuid123.webp" and store only that.
    image_url = "https://pub-xxx.r2.dev/uuid123.webp"
    response = client.post(f"/api/milestones/?baby_id={baby.id}", json={
        "milestone_type": "crawling",
        "title": "ハイハイ",
        "achieved_date": "2026-03-09",
        "image_urls": [image_url],
        "notes": "Secure test"
    })
    
    assert response.status_code == 201
    data = response.json()
    
    # The returned URL should be the signed one
    assert data["image_urls"][0].startswith("https://signed-url.r2.dev/uuid123.webp?signature=")
    
    # Verify what's stored in the database
    db_milestone = db.query(Milestone).filter(Milestone.id == data["id"]).first()
    # It should store only the key "uuid123.webp"
    assert db_milestone.image_urls == ["uuid123.webp"]

@patch("app.utils.s3._get_s3_client")
def test_secure_daily_summary_image_urls(mock_get_s3, auth_client, db):
    # Mock S3 client and presigned URL generation
    mock_client = MagicMock()
    mock_get_s3.return_value = mock_client
    mock_client.generate_presigned_url.side_effect = lambda operation, Params, ExpiresIn: f"https://signed-url.r2.dev/{Params['Key']}?signature=test"

    client, baby, _ = setup_test_data(auth_client, db)
    
    # Create daily summary first (it's created by POST /api/babies/{id}/daily-summary)
    summary_date = "2026-03-09"
    # We need to bypass actual AI generation for test or just assume it works.
    # Here we'll just manually insert a summary to test the PATCH endpoint.
    from app.models.ai_summary import DailySummary
    summary = DailySummary(
        baby_id=baby.id,
        summary_date=date(2026, 3, 9),
        generated_content="Test content",
        is_edited=False
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    # PATCH with image URLs
    image_url = "https://pub-xxx.r2.dev/summary_img.webp"
    response = client.patch(f"/api/babies/{baby.id}/daily-summary/{summary_date}", json={
        "image_urls": [image_url],
        "updated_at": summary.updated_at.isoformat()
    })
    
    assert response.status_code == 200
    data = response.json()
    
    # The returned URL should be the signed one
    assert data["image_urls"][0].startswith("https://signed-url.r2.dev/summary_img.webp?signature=")
    
    # Verify what's stored in the database
    db_summary = db.query(DailySummary).filter(DailySummary.baby_id == baby.id, DailySummary.summary_date == date(2026, 3, 9)).first()
    # It should store only the key "summary_img.webp"
    assert db_summary.image_urls == ["summary_img.webp"]

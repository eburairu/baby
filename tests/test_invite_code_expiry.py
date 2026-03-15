"""招待コード有効期限機能のテスト (issue #873)"""
import pytest
from datetime import datetime, timedelta, timezone
from tests.conftest import client


def test_family_creation_sets_invite_code_expiry(client):
    """ファミリー作成時に招待コードの有効期限が設定される"""
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Test Family", "username": "admin1", "password": "password123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "invite_code_expires_at" in data
    expires_at = datetime.fromisoformat(data["invite_code_expires_at"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    # 有効期限は現在から約48時間後（±5分の誤差を許容）
    assert expires_at > now + timedelta(hours=47, minutes=55)
    assert expires_at < now + timedelta(hours=48, minutes=5)


def test_regenerate_invite_code_resets_expiry(client):
    """招待コード再生成時に有効期限がリセットされる"""
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Regen Family", "username": "admin2", "password": "password123"},
    )
    assert res.status_code == 200
    original_expires = res.json()["invite_code_expires_at"]

    res = client.post("/api/family/invite_code/regenerate")
    assert res.status_code == 200
    data = res.json()
    assert "invite_code_expires_at" in data
    new_expires = datetime.fromisoformat(data["invite_code_expires_at"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    # 再生成後の有効期限は約48時間後
    assert new_expires > now + timedelta(hours=47, minutes=55)
    assert new_expires < now + timedelta(hours=48, minutes=5)


def test_join_with_valid_invite_code_succeeds(client):
    """有効な招待コードでファミリーに参加できる"""
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Join Family", "username": "admin3", "password": "password123"},
    )
    assert res.status_code == 200
    invite_code = res.json()["invite_code"]
    client.cookies.clear()

    res = client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={"username": "newmember", "password": "password123"},
    )
    assert res.status_code == 200


def test_join_with_expired_invite_code_fails(client):
    """期限切れの招待コードではファミリーに参加できない"""
    from app.models.family import Family
    from app.database import SessionLocal

    res = client.post(
        "/api/auth/register/family",
        json={"name": "Expired Family", "username": "admin4", "password": "password123"},
    )
    assert res.status_code == 200
    invite_code = res.json()["invite_code"]
    family_id = res.json()["id"]
    client.cookies.clear()

    # DBで有効期限を過去に設定して期限切れにする
    db = SessionLocal()
    try:
        family = db.query(Family).filter(Family.id == family_id).first()
        family.invite_code_expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
        db.commit()
    finally:
        db.close()

    res = client.post(
        f"/api/auth/register/join?invite_code={invite_code}",
        json={"username": "latemember", "password": "password123"},
    )
    assert res.status_code == 410
    assert "expired" in res.json()["detail"].lower()

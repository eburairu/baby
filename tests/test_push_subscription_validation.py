import pytest
from pydantic import ValidationError
from app.schemas.notification import PushSubscriptionCreate


VALID_P256DH = "dummy_p256dh_key_for_testing"
VALID_AUTH = "dummy_auth_for_testing"


def make_sub(endpoint: str) -> PushSubscriptionCreate:
    return PushSubscriptionCreate(
        endpoint=endpoint,
        p256dh=VALID_P256DH,
        auth=VALID_AUTH,
    )


# ---- 正常系 ----

def test_valid_fcm_endpoint():
    sub = make_sub("https://fcm.googleapis.com/fcm/send/xxx")
    assert sub.endpoint.startswith("https://fcm.googleapis.com")


def test_valid_mozilla_endpoint():
    sub = make_sub("https://push.services.mozilla.com/push/xxx")
    assert sub.endpoint.startswith("https://push.services.mozilla.com")


def test_valid_apple_endpoint():
    sub = make_sub("https://web.push.apple.com/xxx")
    assert sub.endpoint.startswith("https://web.push.apple.com")


# ---- 異常系: スキーム ----

def test_reject_non_https_endpoint():
    with pytest.raises(ValidationError):
        make_sub("http://fcm.googleapis.com/fcm/send/xxx")


# ---- 異常系: プライベートIPアドレス ----

def test_reject_private_ip_endpoint():
    with pytest.raises(ValidationError):
        make_sub("http://192.168.1.1/push")


def test_reject_localhost_endpoint():
    with pytest.raises(ValidationError):
        make_sub("http://localhost/push")


# ---- 異常系: 未知のホスト ----

def test_reject_internal_hostname_endpoint():
    with pytest.raises(ValidationError):
        make_sub("http://internal-service/push")


def test_reject_unknown_public_domain():
    with pytest.raises(ValidationError):
        make_sub("https://evil.example.com/push")


# ---- 異常系: サブドメイン詐称 ----

def test_reject_subdomain_bypass():
    with pytest.raises(ValidationError):
        make_sub("https://fcm.googleapis.com.evil.com/push")


# ---- ルーターレベル結合テスト ----

def test_subscribe_valid_endpoint_returns_200(auth_client):
    client = auth_client()
    response = client.post(
        "/api/notifications/subscribe",
        json={
            "endpoint": "https://fcm.googleapis.com/fcm/send/test-token",
            "p256dh": VALID_P256DH,
            "auth": VALID_AUTH,
        },
    )
    assert response.status_code == 200


def test_subscribe_invalid_endpoint_returns_422(auth_client):
    client = auth_client(username="testuser2", family_name="Family2")
    response = client.post(
        "/api/notifications/subscribe",
        json={
            "endpoint": "https://evil.example.com/push",
            "p256dh": VALID_P256DH,
            "auth": VALID_AUTH,
        },
    )
    assert response.status_code == 422


def test_subscribe_localhost_returns_422(auth_client):
    client = auth_client(username="testuser3", family_name="Family3")
    response = client.post(
        "/api/notifications/subscribe",
        json={
            "endpoint": "http://localhost:8080/push",
            "p256dh": VALID_P256DH,
            "auth": VALID_AUTH,
        },
    )
    assert response.status_code == 422

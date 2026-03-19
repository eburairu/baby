from fastapi import Request
from app.utils.audit import get_client_ip


def test_get_client_ip_with_single_x_forwarded_for():
    # 正常ケース: Render が1ホップで client IP を1エントリ追加した場合
    scope = {
        "type": "http",
        "headers": [
            (b"x-forwarded-for", b"203.0.113.195")
        ],
        "client": ("10.0.0.1", 12345),
    }
    request = Request(scope)
    ip = get_client_ip(request)
    assert ip == "203.0.113.195"


def test_get_client_ip_anti_spoofing(monkeypatch):
    # セキュリティテスト: クライアントが X-Forwarded-For をスプーフィングした場合
    # クライアント (real_ip=203.0.113.195) が "X-Forwarded-For: spoofed_ip" を送信
    # → Render が real_ip を末尾に追加: "spoofed_ip, 203.0.113.195"
    # TRUSTED_PROXY_COUNT=1 ならば末尾の 203.0.113.195 (Render が追加した本物) を返す
    monkeypatch.setenv("TRUSTED_PROXY_COUNT", "1")
    scope = {
        "type": "http",
        "headers": [
            (b"x-forwarded-for", b"spoofed_ip, 203.0.113.195")
        ],
        "client": ("10.0.0.1", 12345),
    }
    request = Request(scope)
    ip = get_client_ip(request)
    assert ip == "203.0.113.195"


def test_get_client_ip_without_x_forwarded_for():
    # Simulate a direct request
    scope = {
        "type": "http",
        "headers": [],
        "client": ("192.168.1.100", 12345),
    }
    request = Request(scope)
    ip = get_client_ip(request)
    assert ip == "192.168.1.100"


def test_get_client_ip_empty():
    scope = {
        "type": "http",
        "headers": [],
        "client": None,
    }
    request = Request(scope)
    ip = get_client_ip(request)
    assert ip is None

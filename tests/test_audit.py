from fastapi import Request
from app.utils.audit import get_client_ip

def test_get_client_ip_with_x_forwarded_for():
    # Simulate a request from a proxy (e.g. Render)
    scope = {
        "type": "http",
        "headers": [
            (b"x-forwarded-for", b"203.0.113.195, 10.0.0.1")
        ],
        "client": ("10.0.0.2", 12345),
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

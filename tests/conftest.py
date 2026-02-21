import os

# app.database のインポート前に DATABASE_URL を設定しないと RuntimeError になる
os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base
from app.dependencies import get_db

# テスト用のインメモリ SQLite データベース
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def mock_cookie_secure(monkeypatch):
    """テスト環境ではSecure Cookieを無効化する"""
    monkeypatch.setenv("COOKIE_SECURE", "false")
    import app.routers.auth
    import app.dependencies
    monkeypatch.setattr(app.routers.auth, "COOKIE_SECURE", False)
    monkeypatch.setattr(app.dependencies, "COOKIE_SECURE", False)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_client(client):
    """認証済みクライアントを作成するためのヘルパー"""
    def _auth(username="testuser", password="testpassword123", family_name="Test Family"):
        # 家族とユーザーを登録
        res = client.post(
            "/api/auth/register/family",
            json={
                "name": family_name,
                "username": username,
                "password": password
            }
        )
        assert res.status_code == 200, f"Registration failed: {res.text}"
        # ログインしてクッキーを保持したクライアントを返す
        login_res = client.post(
            "/api/auth/login",
            json={
                "username": username,
                "password": password
            }
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        assert "access_token" in client.cookies, "No access token in cookies after login"
        return client
    return _auth


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "enable_rate_limit: enable rate limiting for this test"
    )


@pytest.fixture(autouse=True)
def disable_rate_limiter(request, monkeypatch):
    """
    Disable rate limiting for tests by default using monkeypatch on the class method.
    Tests that specifically verify rate limiting should use @pytest.mark.enable_rate_limit.
    """
    # If the test is marked to enable rate limiting, do nothing (let original code run)
    if request.node.get_closest_marker("enable_rate_limit"):
        # Still clear state to ensure isolation
        from app.routers.auth import login_limiter
        login_limiter.requests.clear()
        return

    from app.utils.rate_limit import RateLimiter
    from fastapi import Request

    # Patch __call__ to be a no-op
    # Must include type hint so FastAPI injects the Request object instead of looking for a query param
    async def no_op(self, request: Request):
        pass

    monkeypatch.setattr(RateLimiter, "__call__", no_op)

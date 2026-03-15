import os
import atexit
from urllib.parse import urlparse, urlunparse

try:
    from testcontainers.postgres import PostgresContainer
    import docker.errors

    postgres_container = PostgresContainer("postgres:16-alpine")
    postgres_container.start()

    def _stop_container():
        postgres_container.stop()

    atexit.register(_stop_container)

    DATABASE_URL = postgres_container.get_connection_url()
    print("Using Testcontainers PostgreSQL for tests.")
except Exception as e:
    print(f"Testcontainers could not start ({e}). Falling back to remote test DB.")
    base_url = os.environ.get("DATABASE_URL")
    if not base_url:
        raise RuntimeError("DATABASE_URL must be set if Testcontainers is not available.")

    test_db_name = "botoro_test_db"
    
    from sqlalchemy import create_engine, text
    setup_engine = create_engine(base_url, isolation_level="AUTOCOMMIT")
    try:
        with setup_engine.connect() as conn:
            # PostgreSQL does not support DROP DATABASE IF EXISTS in a transaction block
            # isolation_level="AUTOCOMMIT" handles this.
            conn.execute(text(f"DROP DATABASE IF EXISTS {test_db_name} (FORCE)"))
    except Exception as drop_e:
        # Not all postgres versions support (FORCE), fallback to simple drop
        try:
            with setup_engine.connect() as conn:
                conn.execute(text(f"DROP DATABASE IF EXISTS {test_db_name}"))
        except Exception:
            pass

    try:
        with setup_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE {test_db_name}"))
    except Exception as e:
        print(f"Could not create test database (might already exist): {e}")

    parsed = urlparse(base_url)
    parsed = parsed._replace(path=f"/{test_db_name}")
    DATABASE_URL = urlunparse(parsed)


# app.database のインポート前に DATABASE_URL を設定しないと RuntimeError になる
os.environ["DATABASE_URL"] = DATABASE_URL
# テスト中は全ホストを許可する（TrustedHostMiddleware 対策）
os.environ["ALLOWED_HOSTS"] = "*"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app as fastapi_app
from app.models.base import Base
import app.models  # noqa: F401
from app.dependencies import get_db

# テスト用の PostgreSQL データベース
SQLALCHEMY_DATABASE_URL = DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=NullPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Keep track of the current test connection
_current_connection = None

@pytest.fixture(autouse=True)
def mock_cookie_secure(monkeypatch):
    """テスト環境ではSecure Cookieを無効化する"""
    monkeypatch.setenv("COOKIE_SECURE", "false")
    import app.routers.auth
    import app.dependencies
    monkeypatch.setattr(app.routers.auth, "COOKIE_SECURE", False)
    monkeypatch.setattr(app.dependencies, "COOKIE_SECURE", False)

from sqlalchemy import event

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

@pytest.fixture(scope="function")
def db():
    global _current_connection
    connection = engine.connect()
    _current_connection = connection
    transaction = connection.begin()
    
    session = TestingSessionLocal(bind=connection)
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(session, transaction):
        if transaction.nested and not transaction._parent.nested:
            session.begin_nested()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()
        _current_connection = None

@pytest.fixture(autouse=True)
def patch_session_local(monkeypatch, db):
    """
    Patch SessionLocal so that background tasks use a session bound to the test's connection.
    This ensures they share the uncommitted transaction with the test.
    """
    def override_session_local():
        # Return a new session bound to the same connection and share the same transaction
        session = TestingSessionLocal(bind=_current_connection)
        session.begin_nested()
        
        @event.listens_for(session, "after_transaction_end")
        def restart_savepoint(session, transaction):
            if transaction.nested and not transaction._parent.nested:
                session.begin_nested()
        return session

    import app.database
    import app.utils.notifications
    import app.utils.audit

    monkeypatch.setattr(app.database, "SessionLocal", override_session_local)
    monkeypatch.setattr(app.utils.notifications, "SessionLocal", override_session_local)
    monkeypatch.setattr(app.utils.audit, "SessionLocal", override_session_local)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides.clear()

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

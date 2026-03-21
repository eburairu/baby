import os
import atexit

from testcontainers.postgres import PostgresContainer

postgres_container = PostgresContainer("postgres:16-alpine")
postgres_container.start()
atexit.register(postgres_container.stop)

DATABASE_URL = postgres_container.get_connection_url()

os.environ["DATABASE_URL"] = DATABASE_URL
os.environ["ALLOWED_HOSTS"] = "*"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app as fastapi_app
from app.models.base import Base
import app.models  # noqa: F401
from app.dependencies import get_db

engine = create_engine(DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_current_connection = None


@pytest.fixture(autouse=True)
def mock_cookie_secure(monkeypatch):
    monkeypatch.setenv("COOKIE_SECURE", "false")
    import app.routers.auth
    import app.dependencies
    monkeypatch.setattr(app.routers.auth, "COOKIE_SECURE", False)
    monkeypatch.setattr(app.dependencies, "COOKIE_SECURE", False)


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
        if transaction.is_active:
            transaction.rollback()
        connection.close()
        _current_connection = None


@pytest.fixture(autouse=True)
def patch_session_local(monkeypatch, db):
    def override_session_local():
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
    def _auth(username="testuser", password="testpassword123", family_name="Test Family"):
        res = client.post(
            "/api/auth/register/family",
            json={"name": family_name, "username": username, "password": password},
        )
        assert res.status_code == 200, f"Registration failed: {res.text}"
        login_res = client.post(
            "/api/auth/login",
            json={"username": username, "password": password},
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
    if request.node.get_closest_marker("enable_rate_limit"):
        from app.routers.auth import login_limiter, register_limiter
        login_limiter.requests.clear()
        register_limiter.requests.clear()
        return

    from app.utils.rate_limit import RateLimiter
    from fastapi import Request

    async def no_op(self, request: Request):
        pass

    monkeypatch.setattr(RateLimiter, "__call__", no_op)

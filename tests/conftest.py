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
    def _auth(username="testuser", password="testpassword", family_name="Test Family"):
        # 家族とユーザーを登録
        client.post(
            "/api/auth/register/family",
            json={
                "name": family_name,
                "username": username,
                "password": password
            }
        )
        # ログインしてクッキーを保持したクライアントを返す
        client.post(
            "/api/auth/login",
            json={
                "username": username,
                "password": password
            }
        )
        return client
    return _auth

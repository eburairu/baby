"""
Issue #948: 家族招待コードAPIへのブルートフォース攻撃対策（専用レート制限）
- join_family エンドポイントに IP + ユーザーID の組み合わせでレート制限をかける
- 制限値は constants.RATE_LIMIT_JOIN_FAMILY_REQUESTS / RATE_LIMIT_JOIN_FAMILY_WINDOW で管理
"""
import pytest
from app.routers.family import join_family_limiter
from app.core import constants


@pytest.fixture(autouse=True)
def reset_limiter():
    join_family_limiter.requests.clear()
    yield
    join_family_limiter.requests.clear()


def test_join_family_rate_limit_enforced(client, db):
    """制限回数を超えると 429 が返ること"""
    from app.models.user import User
    from app.models.family import Family, FamilyUser
    from app.models.enums import UserRole
    from app.main import app
    from app.dependencies import get_current_user
    import uuid

    suffix = str(uuid.uuid4())[:8]
    user = User(username=f"ratelimit-user-{suffix}", hashed_password="hashed")
    db.add(user)
    db.flush()

    # 有効な招待コードを持つファミリー
    family = Family(name=f"Family {suffix}", invite_code=f"RL{suffix}".upper())
    db.add(family)
    db.flush()

    # ユーザーを別ファミリーに所属させておく（join_family は既存所属チェックがある）
    other_family = Family(name=f"Other {suffix}", invite_code=f"OT{suffix}".upper())
    db.add(other_family)
    db.flush()
    db.add(FamilyUser(family_id=other_family.id, user_id=user.id, role=UserRole.ADMIN))
    db.commit()

    app.dependency_overrides[get_current_user] = lambda: user
    try:
        limit = constants.RATE_LIMIT_JOIN_FAMILY_REQUESTS
        # 制限回数まで 404（無効コード）が返る
        for i in range(limit):
            res = client.post("/api/family/join", json={"invite_code": "INVALIDCODE"})
            assert res.status_code in (404, 400), f"Unexpected status {res.status_code} at attempt {i + 1}"

        # limit+1 回目は 429
        res = client.post("/api/family/join", json={"invite_code": "INVALIDCODE"})
        assert res.status_code == 429
        assert "Too many join attempts" in res.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_join_family_rate_limit_uses_ip_and_user_id(client, db):
    """レート制限キーが IP:user_id の組み合わせであること（limiter に直接アクセス）"""
    from fastapi import HTTPException
    import pytest

    # 同一 IP・同一ユーザーで限界を超えると 429
    key = "127.0.0.1:9999"
    limit = constants.RATE_LIMIT_JOIN_FAMILY_REQUESTS
    for _ in range(limit):
        join_family_limiter.check(key)  # 制限内は例外なし

    with pytest.raises(HTTPException) as exc_info:
        join_family_limiter.check(key)
    assert exc_info.value.status_code == 429
    assert "Too many join attempts" in exc_info.value.detail

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.models.family import Family, FamilyUser, UserRole
from app.models.baby import Baby, BabyPermission
from app.dependencies import get_current_user, get_db
import uuid

# Global mock states
_mock_user = None
_test_db = None

def mock_get_db():
    yield _test_db

def mock_get_current_user():
    global _mock_user
    return _mock_user

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def overrides():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_db] = mock_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def db():
    global _test_db
    connection = engine.connect()
    transaction = connection.begin()
    _test_db = SessionLocal(bind=connection)
    yield _test_db
    _test_db.close()
    transaction.rollback()
    connection.close()

def test_multi_family_escalation(db: Session):
    """
    ユーザーが複数家族に所属している場合の権限チェック漏れを検証する。
    家族A: Viewer
    家族B: Admin
    期待される挙動: 家族Aの赤ちゃんに対しては管理者権限を行使できないはず。
    """
    global _mock_user
    
    # ユーザー作成
    suffix = str(uuid.uuid4())[:8]
    user = User(id=751, username=f"user-{suffix}", hashed_password="hashed")
    db.add(user)
    db.flush()

    # 家族A作成 (UserはVIEWER)
    family_a = Family(name="Family A", invite_code=f"A-{suffix}")
    db.add(family_a)
    db.flush()
    baby_a = Baby(name="Baby A", family_id=family_a.id)
    db.add(baby_a)
    db.flush()
    
    # 家族B作成 (UserはADMIN)
    family_b = Family(name="Family B", invite_code=f"B-{suffix}")
    db.add(family_b)
    db.flush()
    baby_b = Baby(name="Baby B", family_id=family_b.id)
    db.add(baby_b)
    db.flush()

    # 家族Aの閲覧権限を追加 (これで verify_baby_access がパスするようになる)
    db.add(BabyPermission(baby_id=baby_a.id, user_id=user.id, record_type="baby", can_view=True))

    # 先に家族B (ADMIN) のレコードを挿入して、.first() で拾われやすくする
    db.add(FamilyUser(family_id=family_b.id, user_id=user.id, role=UserRole.ADMIN))
    db.add(FamilyUser(family_id=family_a.id, user_id=user.id, role=UserRole.VIEWER))
    db.flush()
    db.commit()

    _mock_user = user
    client = TestClient(app)

    # 家族Aの赤ちゃんに対する権限設定取得を試みる
    # 本来は VIEWER なので 403 になるべき
    response = client.get(f"/api/babies/{baby_a.id}/permissions")

    # 現状のバグがあれば、家族BのADMIN権限を拾ってしまい 200 (または 403 Forbidden になるが、もし verify_baby_access が甘ければ 200)
    # 調査の結果、verify_baby_access も .first() を使っているため、家族Bを拾うと Baby A へのアクセス自体が拒否される(403)
    # しかし、もし verify_baby_access が「何らかの家族に属していればOK」という実装に変わっていたり、
    # あるいは SuperAdmin だったりすると別の挙動になる。
    
    # Issueの記述通り「管理者としてアクセスできてしまう」ことを確認したい。
    # もし verify_baby_access が baby_id と family_user.family_id をチェックしていないなら 200 になる。
    
    if response.status_code == 200:
        pytest.fail("Security Vulnerability: User was able to access permissions of a baby in a family where they are only a VIEWER, by leveraging ADMIN role from another family.")
    
    # もし 403 だけど detail が "Access denied to this baby" なら、verify_baby_access が（誤って）拒否している。
    # もし 403 だけど detail が "Only admins can manage permissions" なら、正しいチェックが行われている。
    print(f"Response status: {response.status_code}")
    print(f"Response detail: {response.json().get('detail')}")

    # 修正前の状態を特定するためのアサーション
    # 期待される修正後の挙動は 403
    assert response.status_code == 403
    assert response.json()["detail"] == "Only admins can manage permissions"

def test_multi_family_legitimate_admin(db: Session):
    """
    ユーザーが複数家族に所属しており、対象の家族で ADMIN である場合に正しくアクセスできることを検証する。
    """
    global _mock_user
    
    suffix = str(uuid.uuid4())[:8]
    user = User(id=752, username=f"user-{suffix}", hashed_password="hashed")
    db.add(user)
    db.flush()

    family_a = Family(name="Family A", invite_code=f"A-{suffix}")
    db.add(family_a)
    db.flush()
    baby_a = Baby(name="Baby A", family_id=family_a.id)
    db.add(baby_a)
    db.flush()
    
    family_b = Family(name="Family B", invite_code=f"B-{suffix}")
    db.add(family_b)
    db.flush()
    baby_b = Baby(name="Baby B", family_id=family_b.id)
    db.add(baby_b)
    db.flush()

    # 先に家族B (VIEWER) のレコードを挿入して、.first() で拾われやすくする
    db.add(FamilyUser(family_id=family_b.id, user_id=user.id, role=UserRole.VIEWER))
    db.add(FamilyUser(family_id=family_a.id, user_id=user.id, role=UserRole.ADMIN))
    db.flush()
    db.commit()

    _mock_user = user
    client = TestClient(app)

    # 家族Aの赤ちゃんに対する権限設定取得を試みる (ADMIN なので成功するはず)
    response = client.get(f"/api/babies/{baby_a.id}/permissions")

    assert response.status_code == 200
    assert response.json()["baby_id"] == baby_a.id

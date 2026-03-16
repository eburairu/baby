import pytest
import uuid
from sqlalchemy.orm import Session
from app.models.baby import Baby
from app.models.feeding import Feeding
from app.models.family import Family
from datetime import datetime, timezone

from app.models.user import User

def test_soft_delete_filter_global(db: Session):
    """
    is_deleted=True のレコードが通常のクエリで取得されないことを確認する。
    """
    # 1. データ作成
    family = Family(name="テスト家族", invite_code=str(uuid.uuid4())[:8])
    db.add(family)
    db.flush()
    
    baby = Baby(family_id=family.id, name="削除済み赤ちゃん", birthday=datetime.now().date(), is_deleted=True)
    db.add(baby)
    db.commit()
    
    # 2. 通常のクエリで取得されないことを期待 (現状は取得できてしまうはず)
    result = db.query(Baby).filter(Baby.id == baby.id).first()
    assert result is None, "is_deleted=True のレコードは取得されないべき"

def test_soft_delete_filter_with_include_deleted(db: Session):
    """
    include_deleted=True オプションを指定した場合は取得できることを確認する。
    """
    family = Family(name="テスト家族2", invite_code=str(uuid.uuid4())[:8])
    db.add(family)
    db.flush()
    
    baby = Baby(family_id=family.id, name="削除済み赤ちゃん2", birthday=datetime.now().date(), is_deleted=True)
    db.add(baby)
    db.commit()
    
    # include_deleted=True を指定
    result = db.query(Baby).execution_options(include_deleted=True).filter(Baby.id == baby.id).first()
    assert result is not None
    assert result.is_deleted is True

def test_soft_delete_filter_join(db: Session):
    """
    Join した際もフィルタが効くことを確認する。
    """
    family = Family(name="テスト家族3", invite_code=str(uuid.uuid4())[:8])
    db.add(family)
    db.flush()

    user = User(username=f"testuser_{uuid.uuid4().hex[:8]}", hashed_password="hashed_password")
    db.add(user)
    db.flush()
    
    baby = Baby(family_id=family.id, name="生存赤ちゃん", birthday=datetime.now().date(), is_deleted=False)
    db.add(baby)
    db.flush()
    
    feeding = Feeding(
        baby_id=baby.id,
        user_id=user.id,
        feeding_time=datetime.now(timezone.utc),
        feeding_type="BOTTLE",
        amount_ml=100,
        is_deleted=True
    )
    db.add(feeding)
    db.commit()
    
    # Baby に紐づく Feeding を取得しようとした際、is_deleted=True のものが除外されることを期待
    feedings = db.query(Feeding).filter(Feeding.baby_id == baby.id).all()
    assert len(feedings) == 0, "論理削除された授乳記録はクエリ結果から除外されるべき"

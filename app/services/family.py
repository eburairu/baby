from sqlalchemy.orm import Session
from app.models.family import Family
from app.models.baby import Baby
from app.services.baby import soft_delete_baby

def soft_delete_family(db: Session, family: Family):
    """
    家族を論理削除し、紐づくすべての赤ちゃんとその記録も再帰的に論理削除する。
    """
    # 家族に紐づくすべての赤ちゃんを取得
    babies = db.query(Baby).filter(Baby.family_id == family.id, Baby.is_deleted == False).all()
    
    for baby in babies:
        # 各赤ちゃんを再帰的に論理削除（記録も削除される）
        soft_delete_baby(db, baby)
    
    # 家族自身を論理削除
    family.is_deleted = True
    db.commit()

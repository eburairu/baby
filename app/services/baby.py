from sqlalchemy.orm import Session
from typing import Union, Dict, Any, Optional
from datetime import date
from app.models.baby import Baby
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.note import Note
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.milestone import Milestone
from app.models.vaccination import Vaccination
from app.models.temperature import TemperatureRecord
from app.models.comment import RecordComment
from app.models.ai_summary import DailySummary
from app.schemas.baby import BabyUpdate

def get_baby(db: Session, baby_id: int) -> Optional[Baby]:
    return db.query(Baby).filter(Baby.id == baby_id).first()

def get_baby_age_in_days(baby: Baby, target_date: date) -> Optional[int]:
    """赤ちゃんの生後日数を計算する。誕生日当日は 0。"""
    if not baby.birthday:
        return None
    return (target_date - baby.birthday).days

def update_baby(db: Session, baby: Baby, update_data: Union[BabyUpdate, Dict[str, Any]]) -> Baby:
    """
    Update baby attributes.
    update_data can be a BabyUpdate Pydantic model or a dictionary.
    """
    if isinstance(update_data, BabyUpdate):
        update_data = update_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(baby, key):
            setattr(baby, key, value)
    
    db.commit()
    db.refresh(baby)
    return baby

def soft_delete_baby(db: Session, baby: Baby):
    """
    赤ちゃんを論理削除し、関連するすべての記録も論理削除する。
    commit は呼び出し元が責任を持つ（atomic な操作のため）。
    """
    # 関連する記録の論理削除
    models_to_soft_delete = [
        Feeding, Sleep, Diaper, Growth, Note, Contraction,
        Schedule, Milestone, Vaccination, TemperatureRecord,
        RecordComment, DailySummary
    ]

    for model in models_to_soft_delete:
        records = db.query(model).filter(model.baby_id == baby.id).all()
        for record in records:
            record.is_deleted = True

    # 赤ちゃん自身を論理削除
    baby.is_deleted = True

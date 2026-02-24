from sqlalchemy.orm import Session
from typing import Union, Dict, Any, Optional
from datetime import date
from app.models.baby import Baby
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

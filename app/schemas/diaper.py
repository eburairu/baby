from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.diaper import DiaperType


class DiaperCreate(BaseModel):
    baby_id: int
    change_time: datetime
    diaper_type: DiaperType
    notes: Optional[str] = None


class DiaperResponse(DiaperCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

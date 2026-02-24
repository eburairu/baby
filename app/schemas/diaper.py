from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.diaper import DiaperType
from app.core.constants import NOTE_MAX_LENGTH


class DiaperCreate(BaseModel):
    baby_id: int
    change_time: datetime
    diaper_type: DiaperType
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class DiaperUpdate(BaseModel):
    change_time: Optional[datetime] = None
    diaper_type: Optional[DiaperType] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)



class DiaperResponse(DiaperCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

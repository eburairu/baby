from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.core.constants import NOTE_MAX_LENGTH


class SleepCreate(BaseModel):
    baby_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class SleepUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class SleepResponse(SleepCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

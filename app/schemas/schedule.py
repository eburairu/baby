from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime
from app.core.constants import NOTE_MAX_LENGTH
from app.utils.timezone import localize_naive_as_jst


class ScheduleCreate(BaseModel):
    baby_id: int
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)
    scheduled_time: datetime
    is_completed: bool = False

    @field_validator('scheduled_time', mode='before')
    @classmethod
    def localize_scheduled_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class ScheduleResponse(ScheduleCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

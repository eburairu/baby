from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime
from app.core.constants import NOTE_MAX_LENGTH
from app.utils.timezone import localize_naive_as_jst


class ContractionCreate(BaseModel):
    baby_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    interval_seconds: Optional[int] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

    @field_validator('start_time', 'end_time', mode='before')
    @classmethod
    def localize_times(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class ContractionUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

    @field_validator('start_time', 'end_time', mode='before')
    @classmethod
    def localize_times(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class ContractionResponse(ContractionCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

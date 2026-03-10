from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional
from app.core.constants import NOTE_MAX_LENGTH
from app.utils.timezone import localize_naive_as_jst


class NoteBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=NOTE_MAX_LENGTH)
    note_time: datetime

    @field_validator('note_time', mode='before')
    @classmethod
    def localize_note_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=NOTE_MAX_LENGTH)
    note_time: Optional[datetime] = None

    @field_validator('note_time', mode='before')
    @classmethod
    def localize_note_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class NoteResponse(NoteBase):
    id: int
    baby_id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

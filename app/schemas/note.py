from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.core.constants import NOTE_MAX_LENGTH

class NoteBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=NOTE_MAX_LENGTH)
    note_time: datetime

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=NOTE_MAX_LENGTH)
    note_time: Optional[datetime] = None

class NoteResponse(NoteBase):
    id: int
    baby_id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

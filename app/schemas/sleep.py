from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class SleepCreate(BaseModel):
    baby_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    notes: Optional[str] = None


class SleepUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None


class SleepResponse(SleepCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

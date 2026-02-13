from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScheduleCreate(BaseModel):
    baby_id: int
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    is_completed: bool = False


class ScheduleResponse(ScheduleCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

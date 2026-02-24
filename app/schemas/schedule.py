from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class ScheduleCreate(BaseModel):
    baby_id: int
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    scheduled_time: datetime
    is_completed: bool = False


class ScheduleResponse(ScheduleCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

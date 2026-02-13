from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SleepCreate(BaseModel):
    baby_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    notes: Optional[str] = None


class SleepResponse(SleepCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

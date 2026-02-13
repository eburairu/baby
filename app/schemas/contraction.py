from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContractionCreate(BaseModel):
    baby_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    interval_seconds: Optional[int] = None
    notes: Optional[str] = None


class ContractionResponse(ContractionCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

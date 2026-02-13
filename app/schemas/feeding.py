from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.feeding import FeedingType


class FeedingCreate(BaseModel):
    baby_id: int
    feeding_time: datetime
    feeding_type: FeedingType
    amount_ml: Optional[float] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class FeedingResponse(FeedingCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

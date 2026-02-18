import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class GrowthCreate(BaseModel):
    baby_id: int
    date: datetime.date
    weight: Optional[int] = None  # in grams
    height: Optional[float] = None  # in cm
    head_circumference: Optional[float] = None  # in cm
    notes: Optional[str] = None


class GrowthUpdate(BaseModel):
    date: Optional[datetime.date] = None
    weight: Optional[int] = None
    height: Optional[float] = None
    head_circumference: Optional[float] = None
    notes: Optional[str] = None


class GrowthResponse(GrowthCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class GrowthCreate(BaseModel):
    baby_id: int
    measurement_date: date
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    head_circumference_cm: Optional[float] = None
    notes: Optional[str] = None


class GrowthResponse(GrowthCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

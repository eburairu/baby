from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models.temperature import TemperatureMethod
from app.core.constants import NOTE_MAX_LENGTH

TEMPERATURE_MIN = 34.0
TEMPERATURE_MAX = 42.0


class TemperatureCreate(BaseModel):
    baby_id: int
    measured_at: datetime
    temperature: float = Field(..., ge=TEMPERATURE_MIN, le=TEMPERATURE_MAX)
    method: TemperatureMethod = TemperatureMethod.AXILLARY
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class TemperatureUpdate(BaseModel):
    measured_at: Optional[datetime] = None
    temperature: Optional[float] = Field(None, ge=TEMPERATURE_MIN, le=TEMPERATURE_MAX)
    method: Optional[TemperatureMethod] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class TemperatureResponse(TemperatureCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

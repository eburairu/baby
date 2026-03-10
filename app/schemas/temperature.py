from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.enums import TemperatureMethod
from app.core.constants import NOTE_MAX_LENGTH
from app.utils.timezone import localize_naive_as_jst
from app.schemas.achievement import UnlockedAchievementInfo

TEMPERATURE_MIN = 34.0
TEMPERATURE_MAX = 42.0


class TemperatureCreate(BaseModel):
    baby_id: int
    measured_at: datetime
    temperature: float = Field(..., ge=TEMPERATURE_MIN, le=TEMPERATURE_MAX)
    method: TemperatureMethod = TemperatureMethod.AXILLARY
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

    @field_validator('measured_at', mode='before')
    @classmethod
    def localize_measured_at(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class TemperatureUpdate(BaseModel):
    measured_at: Optional[datetime] = None
    temperature: Optional[float] = Field(None, ge=TEMPERATURE_MIN, le=TEMPERATURE_MAX)
    method: Optional[TemperatureMethod] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

    @field_validator('measured_at', mode='before')
    @classmethod
    def localize_measured_at(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class TemperatureResponse(TemperatureCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0
    unlocked_achievements: List[UnlockedAchievementInfo] = []

    model_config = ConfigDict(from_attributes=True)

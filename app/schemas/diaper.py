from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.enums import DiaperType
from app.core.constants import NOTE_MAX_LENGTH
from app.utils.timezone import localize_naive_as_jst
from app.schemas.achievement import UnlockedAchievementInfo


class DiaperCreate(BaseModel):
    baby_id: int
    change_time: datetime
    diaper_type: DiaperType
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)
    poop_color: Optional[str] = Field(None, max_length=50)
    poop_consistency: Optional[str] = Field(None, max_length=50)
    poop_amount: Optional[str] = Field(None, max_length=50)

    @field_validator('change_time', mode='before')
    @classmethod
    def localize_change_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class DiaperUpdate(BaseModel):
    change_time: Optional[datetime] = None
    diaper_type: Optional[DiaperType] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)
    poop_color: Optional[str] = Field(None, max_length=50)
    poop_consistency: Optional[str] = Field(None, max_length=50)
    poop_amount: Optional[str] = Field(None, max_length=50)

    @field_validator('change_time', mode='before')
    @classmethod
    def localize_change_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


class DiaperResponse(DiaperCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0
    unlocked_achievements: List[UnlockedAchievementInfo] = []

    model_config = ConfigDict(from_attributes=True)

import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.core.constants import NOTE_MAX_LENGTH
from app.schemas.achievement import UnlockedAchievementInfo


class GrowthCreate(BaseModel):
    baby_id: int
    date: datetime.date
    weight: Optional[int] = None  # in grams
    height: Optional[float] = None  # in cm
    head_circumference: Optional[float] = None  # in cm
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class GrowthUpdate(BaseModel):
    date: Optional[datetime.date] = None
    weight: Optional[int] = None
    height: Optional[float] = None
    head_circumference: Optional[float] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)


class GrowthResponse(GrowthCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0
    unlocked_achievements: List[UnlockedAchievementInfo] = []

    model_config = ConfigDict(from_attributes=True)

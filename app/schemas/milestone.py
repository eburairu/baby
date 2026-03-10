from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import date
from typing import Optional, List
from app.core.constants import NOTE_MAX_LENGTH
from app.utils.s3 import sign_image_urls
from app.schemas.achievement import UnlockedAchievementInfo

class MilestoneBase(BaseModel):
    milestone_type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=100)
    achieved_date: date
    image_urls: List[str] = []
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    milestone_type: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=100)
    achieved_date: Optional[date] = None
    image_urls: Optional[List[str]] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

class MilestoneResponse(MilestoneBase):
    id: int
    baby_id: int
    user_id: Optional[int]
    unlocked_achievements: List[UnlockedAchievementInfo] = []

    @field_validator("image_urls", mode="after")
    @classmethod
    def secure_image_urls(cls, v: List[str]) -> List[str]:
        return sign_image_urls(v)

    model_config = ConfigDict(from_attributes=True)
class MilestoneTimelineGroup(BaseModel):
    month_age: int
    milestones: List[MilestoneResponse]

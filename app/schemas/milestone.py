from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List

class MilestoneBase(BaseModel):
    milestone_type: str
    title: str
    achieved_date: date
    image_urls: List[str] = []
    notes: Optional[str] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    milestone_type: Optional[str] = None
    title: Optional[str] = None
    achieved_date: Optional[date] = None
    image_urls: Optional[List[str]] = None
    notes: Optional[str] = None

class MilestoneResponse(MilestoneBase):
    id: int
    baby_id: int
    user_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)
class MilestoneTimelineGroup(BaseModel):
    month_age: int
    milestones: List[MilestoneResponse]

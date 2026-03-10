from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Literal
from datetime import datetime
from app.utils.timezone import localize_naive_as_jst


# --- 陣痛タイマー ---
class ContractionTimerResponse(BaseModel):
    status: Literal["idle", "timing"]
    start_time: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


class ContractionTimerUpdate(BaseModel):
    status: Literal["idle", "timing"]
    start_time: Optional[datetime] = None

    @field_validator('start_time', mode='before')
    @classmethod
    def localize_start_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v


# --- 授乳タイマー ---
class FeedingTimerResponse(BaseModel):
    active_side: Optional[Literal["LEFT", "RIGHT"]]
    left_elapsed_seconds: int
    right_elapsed_seconds: int
    segment_start_time: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


class FeedingTimerUpdate(BaseModel):
    active_side: Optional[Literal["LEFT", "RIGHT"]] = None
    left_elapsed_seconds: Optional[int] = None
    right_elapsed_seconds: Optional[int] = None
    segment_start_time: Optional[datetime] = None

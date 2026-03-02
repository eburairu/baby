from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime


# --- 陣痛タイマー ---
class ContractionTimerResponse(BaseModel):
    status: Literal["idle", "timing"]
    start_time: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


class ContractionTimerUpdate(BaseModel):
    status: Literal["idle", "timing"]
    start_time: Optional[datetime] = None


# --- 授乳タイマー ---
class FeedingTimerResponse(BaseModel):
    active_side: Optional[Literal["LEFT", "RIGHT"]]
    left_elapsed_seconds: int
    right_elapsed_seconds: int
    segment_start_time: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


class FeedingTimerUpdate(BaseModel):
    active_side: Optional[Literal["LEFT", "RIGHT"]] = None
    left_elapsed_seconds: int = 0
    right_elapsed_seconds: int = 0
    segment_start_time: Optional[datetime] = None

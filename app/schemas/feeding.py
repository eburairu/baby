from pydantic import BaseModel, ConfigDict, model_validator, Field, field_validator
from typing import Optional
from datetime import datetime
from app.utils.timezone import localize_naive_as_jst
from app.models.feeding import FeedingType, BreastSide, BottleContentType, FeedingCompletion
from app.core.constants import (
    NOTE_MAX_LENGTH,
    MAX_FEEDING_ML,
    MAX_FEEDING_DURATION_MINUTES,
    MAX_BREAST_FEEDING_MINUTES
)


class FeedingCreate(BaseModel):
    baby_id: int
    feeding_time: datetime

    @field_validator('feeding_time', mode='before')
    @classmethod
    def localize_feeding_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v
    feeding_type: FeedingType
    amount_ml: Optional[float] = Field(None, ge=0, le=MAX_FEEDING_ML)
    duration_minutes: Optional[int] = Field(None, ge=0, le=MAX_FEEDING_DURATION_MINUTES)
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)
    # Phase 1
    left_breast_minutes: Optional[int] = Field(None, ge=0, le=MAX_BREAST_FEEDING_MINUTES)
    right_breast_minutes: Optional[int] = Field(None, ge=0, le=MAX_BREAST_FEEDING_MINUTES)
    last_breast_side: Optional[BreastSide] = None
    # Phase 2
    bottle_content_type: Optional[BottleContentType] = None
    feeding_completion: Optional[FeedingCompletion] = None
    # Phase 3: ゲップの有無
    burped: Optional[bool] = None

    @model_validator(mode="after")
    def auto_calc_duration(self) -> "FeedingCreate":
        """左右の分数が両方指定された場合、duration_minutesを自動計算する"""
        if self.left_breast_minutes is not None and self.right_breast_minutes is not None:
            self.duration_minutes = self.left_breast_minutes + self.right_breast_minutes
        return self


class FeedingResponse(FeedingCreate):
    id: int
    user_id: int
    recorded_by_display_name: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class FeedingUpdate(BaseModel):
    feeding_time: Optional[datetime] = None

    @field_validator('feeding_time', mode='before')
    @classmethod
    def localize_feeding_time(cls, v):
        return localize_naive_as_jst(v) if isinstance(v, datetime) else v
    feeding_type: Optional[FeedingType] = None
    amount_ml: Optional[float] = Field(None, ge=0, le=MAX_FEEDING_ML)
    duration_minutes: Optional[int] = Field(None, ge=0, le=MAX_FEEDING_DURATION_MINUTES)
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)
    # Phase 1
    left_breast_minutes: Optional[int] = Field(None, ge=0, le=MAX_BREAST_FEEDING_MINUTES)
    right_breast_minutes: Optional[int] = Field(None, ge=0, le=MAX_BREAST_FEEDING_MINUTES)
    last_breast_side: Optional[BreastSide] = None
    # Phase 2
    bottle_content_type: Optional[BottleContentType] = None
    feeding_completion: Optional[FeedingCompletion] = None
    # Phase 3: ゲップの有無
    burped: Optional[bool] = None

    @model_validator(mode="after")
    def auto_calc_duration(self) -> "FeedingUpdate":
        """左右の分数が両方指定された場合、duration_minutesを自動計算する"""
        if self.left_breast_minutes is not None and self.right_breast_minutes is not None:
            self.duration_minutes = self.left_breast_minutes + self.right_breast_minutes
        return self

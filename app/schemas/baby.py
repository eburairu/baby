from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, Literal
from datetime import date, datetime


class BabyBase(BaseModel):
    name: str = Field(..., max_length=100)
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = Field(None, max_length=1000)
    feeding_threshold_minutes: Optional[int] = None
    diaper_threshold_minutes: Optional[int] = None


class BabyCreate(BabyBase):
    pass


class BabyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = Field(None, max_length=1000)
    feeding_threshold_minutes: Optional[int] = None
    diaper_threshold_minutes: Optional[int] = None

    @field_validator('name')
    @classmethod
    def name_must_not_be_none(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            raise ValueError('Name cannot be null')
        return v


class BabyResponse(BabyBase):
    id: int
    family_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

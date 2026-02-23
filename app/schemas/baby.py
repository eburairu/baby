from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal
from datetime import date, datetime


class BabyBase(BaseModel):
    name: str = Field(..., max_length=100)
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = Field(None, max_length=1000)


class BabyCreate(BabyBase):
    pass


class BabyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = Field(None, max_length=1000)


class BabyResponse(BabyBase):
    id: int
    family_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

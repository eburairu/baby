from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import date, datetime


class BabyBase(BaseModel):
    name: str
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = None


class BabyCreate(BabyBase):
    pass


class BabyUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = None


class BabyResponse(BabyBase):
    id: int
    family_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

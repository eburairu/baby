from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class BabyBase(BaseModel):
    name: str
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    characteristics: Optional[str] = None


class BabyCreate(BabyBase):
    pass


class BabyUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    characteristics: Optional[str] = None


class BabyResponse(BabyBase):
    id: int
    family_id: int
    created_at: datetime

    class Config:
        from_attributes = True

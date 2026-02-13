from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class BabyBase(BaseModel):
    name: str
    birthday: Optional[date] = None
    due_date: Optional[date] = None


class BabyCreate(BabyBase):
    pass


class BabyResponse(BabyBase):
    id: int
    family_id: int
    created_at: datetime

    class Config:
        from_attributes = True

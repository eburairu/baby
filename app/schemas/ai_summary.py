from pydantic import BaseModel, computed_field
from typing import Optional
from datetime import date, datetime


class DailySummaryCreate(BaseModel):
    summary_date: date


class DailySummaryEdit(BaseModel):
    edited_content: Optional[str] = None


class DailySummaryResponse(BaseModel):
    id: int
    baby_id: int
    user_id: Optional[int]
    summary_date: date
    generated_content: str
    edited_content: Optional[str]
    is_edited: bool
    model_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def display_content(self) -> str:
        return self.edited_content if self.edited_content else self.generated_content

    class Config:
        from_attributes = True

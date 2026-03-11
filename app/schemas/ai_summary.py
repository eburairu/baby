from pydantic import BaseModel, computed_field, ConfigDict, field_validator
from typing import Optional, List
from datetime import date, datetime
from app.utils.s3 import sign_image_urls


class DailySummaryCreate(BaseModel):
    summary_date: date


class DailySummaryEdit(BaseModel):
    edited_content: Optional[str] = None
    image_urls: Optional[list[str]] = None
    updated_at: datetime


class DailySummaryResponse(BaseModel):
    id: int
    baby_id: int
    user_id: Optional[int]
    summary_date: date
    generated_content: str
    edited_content: Optional[str]
    is_edited: bool
    model_name: Optional[str]
    image_urls: list[str] = []
    created_at: datetime
    updated_at: datetime

    @field_validator("image_urls", mode="after")
    @classmethod
    def secure_image_urls(cls, v: List[str]) -> List[str]:
        return sign_image_urls(v)

    @computed_field
    @property
    def display_content(self) -> str:
        return self.edited_content if self.edited_content else self.generated_content

    model_config = ConfigDict(from_attributes=True)

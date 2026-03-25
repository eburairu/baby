from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.enums import RelationshipType


class RelativeCreate(BaseModel):
    name: str
    relationship_type: RelationshipType
    user_id: Optional[int] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be empty")
        if len(v) > 100:
            raise ValueError("name must be 100 characters or less")
        return v

    @field_validator("notes")
    @classmethod
    def notes_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError("notes must be 500 characters or less")
        return v


class RelativeUpdate(BaseModel):
    name: Optional[str] = None
    relationship_type: Optional[RelationshipType] = None
    user_id: Optional[int] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("name must not be empty")
            if len(v) > 100:
                raise ValueError("name must be 100 characters or less")
        return v


class RelativeResponse(BaseModel):
    id: int
    baby_id: int
    name: str
    relationship_type: RelationshipType
    user_id: Optional[int] = None
    user_display_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

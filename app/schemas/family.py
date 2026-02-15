from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class FamilyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator('password')
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class FamilyResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class FamilyMemberResponse(BaseModel):
    user_id: int
    username: str
    display_name: Optional[str] = None
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class MemberRoleUpdate(BaseModel):
    role: str

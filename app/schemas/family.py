from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class FamilyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8, max_length=128, pattern=r"^(?=.*[a-zA-Z])(?=.*\d).+$")


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

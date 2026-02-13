from pydantic import BaseModel
from datetime import datetime


class FamilyCreate(BaseModel):
    name: str
    username: str
    password: str


class FamilyResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyUpdate(BaseModel):
    name: str


class FamilyMemberResponse(BaseModel):
    user_id: int
    username: str
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class MemberRoleUpdate(BaseModel):
    role: str

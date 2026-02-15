from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    role: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

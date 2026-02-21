from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime


class UserCreate(BaseModel):
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


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator('new_password')
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    role: Optional[str] = None
    is_superadmin: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SuperAdminToggleRequest(BaseModel):
    is_superadmin: bool

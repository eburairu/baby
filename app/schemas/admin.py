from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.user import UserResponse

class AdminStats(BaseModel):
    total_users: int
    total_families: int
    total_records: int
    active_users_last_24h: int

class FamilyCreateAdmin(BaseModel):
    name: str

class FamilyCreateResponseAdmin(BaseModel):
    id: int
    name: str
    invite_code: str
    created_at: datetime

class FamilyAdminResponse(BaseModel):
    id: int
    name: str
    member_count: int
    created_at: datetime

class AdminFamilyMemberResponse(BaseModel):
    user_id: int
    username: str
    display_name: Optional[str] = None
    role: str
    joined_at: datetime

class BabyAdminResponse(BaseModel):
    id: int
    name: str
    birthday: Optional[str] = None
    gender: Optional[str] = None
    created_at: datetime

class FamilyDetailResponse(BaseModel):
    id: int
    name: str
    member_count: int
    created_at: datetime
    members: List[AdminFamilyMemberResponse]
    babies: List[BabyAdminResponse]

class UserAdminResponse(UserResponse):
    is_superadmin: bool

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    username: Optional[str]
    action: str
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

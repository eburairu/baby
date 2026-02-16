from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    user_id: int
    user_display_name: Optional[str]
    user_role: str  # "admin", "member", "viewer"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

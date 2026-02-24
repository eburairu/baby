from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional


class CommentBase(BaseModel):
    content: str = Field(..., max_length=2000)


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    user_id: Optional[int]
    user_display_name: Optional[str]
    user_role: str  # "admin", "member", "viewer"
    created_at: datetime
    is_ai_generated: bool = False
    ai_has_concern: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel
from typing import List, Literal


VALID_RECORD_TYPES = Literal["baby", "feeding", "sleep", "diaper", "growth", "contraction", "schedule", "vaccination", "note", "milestone"]


class BabyPermissionItem(BaseModel):
    """単一の権限レコード（1ユーザー × 1record_type）"""
    record_type: str
    can_view: bool


class UserPermissionSet(BaseModel):
    """1ユーザーに対するすべての record_type の権限セット"""
    user_id: int
    username: str
    permissions: List[BabyPermissionItem]


class BabyPermissionsResponse(BaseModel):
    """GET レスポンス: 赤ちゃん 1 体の全メンバー権限"""
    baby_id: int
    baby_name: str
    members: List[UserPermissionSet]


class UserPermissionEntry(BaseModel):
    """PUT 用: 1ユーザー × 1record_type の更新エントリ"""
    user_id: int
    record_type: str  # 有効値は VALID_RECORD_TYPES
    can_view: bool


class BabyPermissionUpdate(BaseModel):
    """PUT リクエストボディ: 赤ちゃん 1 体の全権限を一括更新"""
    permissions: List[UserPermissionEntry]

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UnlockedAchievementInfo(BaseModel):
    """記録APIレスポンスに含める実績解除情報"""
    achievement_id: str
    name: str
    icon: str
    category: str
    rarity: str
    description: str


class BabyAchievementResponse(BaseModel):
    """実績一覧APIのレスポンス"""
    id: int
    baby_id: int
    achievement_id: str
    achieved_at: datetime
    triggered_by_display_name: Optional[str] = None
    # Achievement metadata (definitions.py から展開)
    name: str
    icon: str
    category: str
    rarity: str
    description: str

    model_config = ConfigDict(from_attributes=True)

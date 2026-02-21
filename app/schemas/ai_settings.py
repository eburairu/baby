from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List, Optional
from datetime import datetime


class AISettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    value: str
    updated_at: datetime


class AISettingsPatch(BaseModel):
    """
    PATCH /api/ai/settings リクエストボディ
    """
    settings: Dict[str, str]  # key -> value の辞書


class AIModel(BaseModel):
    id: str
    name: str
    description: str


class AISettingsSummary(BaseModel):
    """
    GET /api/ai/settings レスポンス
    """
    settings: Dict[str, Any]  # 型変換済みの設定値
    available_models: List[AIModel]

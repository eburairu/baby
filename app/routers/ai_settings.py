from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.system_settings import SystemSetting
from app.utils.rate_limit import RateLimiter
from app.core.constants import RATE_LIMIT_AI_SETTINGS_REQUESTS, RATE_LIMIT_AI_SETTINGS_WINDOW
from app.schemas.ai_settings import AISettingsSummary, AISettingsPatch, AIModel
from app.services.ai_settings import get_ai_config, get_available_llm_models
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai-settings"])

ai_settings_limiter = RateLimiter(
    requests_limit=RATE_LIMIT_AI_SETTINGS_REQUESTS,
    time_window=RATE_LIMIT_AI_SETTINGS_WINDOW,
    error_message="Too many requests to AI settings. Please try again later."
)

def verify_admin_access(db: Session, user: User):
    """
    ユーザーが SuperAdmin であるか検証する。
    """
    if not user.is_superadmin:
        logger.warning(f"Unauthorized superadmin access attempt by user {user.id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SuperAdmin access required"
        )
    return True


@router.get("/settings", response_model=AISettingsSummary, dependencies=[Depends(ai_settings_limiter)])
def get_ai_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    現在の AI 設定と利用可能なモデルリストを取得する。
    """
    verify_admin_access(db, current_user)
    
    config = get_ai_config(db)
    models = get_available_llm_models()
    
    return {
        "settings": config,
        "available_models": models
    }


@router.patch("/settings", response_model=Dict[str, str], dependencies=[Depends(ai_settings_limiter)])
def update_ai_settings(
    payload: AISettingsPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI 設定を更新する。
    """
    verify_admin_access(db, current_user)
    
    updated_keys = []
    for key, value in payload.settings.items():
        # 既存の設定を確認
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = value
        else:
            # 新規作成（シードデータ以外が指定された場合）
            setting = SystemSetting(key=key, value=value)
            db.add(setting)
        updated_keys.append(key)
    
    db.commit()
    return {"message": f"Updated {len(updated_keys)} settings", "keys": ",".join(updated_keys)}


@router.get("/available-models", response_model=List[AIModel], dependencies=[Depends(ai_settings_limiter)])
def list_available_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    利用可能な LLM モデルを外部 API から取得する。
    """
    verify_admin_access(db, current_user)
    return get_available_llm_models()

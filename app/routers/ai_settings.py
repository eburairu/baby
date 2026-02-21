from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.family import FamilyUser, UserRole
from app.models.system_settings import SystemSetting
from app.schemas.ai_settings import AISettingsSummary, AISettingsPatch, AIModel
from app.services.ai_settings import get_ai_config, get_available_llm_models

router = APIRouter(prefix="/api/ai", tags=["ai-settings"])


def verify_admin_access(db: Session, user: User):
    """
    ユーザーが SuperAdmin であるか、いずれかの家族の admin ロールを持っているか検証する。
    """
    if user.is_superadmin:
        return True

    admin_user = db.query(FamilyUser).filter(
        FamilyUser.user_id == user.id,
        FamilyUser.role == UserRole.ADMIN
    ).first()
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return admin_user


@router.get("/settings", response_model=AISettingsSummary)
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


@router.patch("/settings", response_model=Dict[str, str])
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


@router.get("/available-models", response_model=List[AIModel])
def list_available_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    利用可能な LLM モデルを外部 API から取得する。
    """
    verify_admin_access(db, current_user)
    return get_available_llm_models()

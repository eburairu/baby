from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.notification import PushSubscription, NotificationSetting
from app.schemas.notification import (
    PushSubscriptionCreate,
    PushSubscriptionResponse,
    NotificationSettingsResponse,
    NotificationSettingsUpdate
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.post("/subscribe", response_model=PushSubscriptionResponse)
def subscribe(
    subscription_in: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # すでに同じエンドポイントがあるか確認
    existing = db.query(PushSubscription).filter(
        PushSubscription.endpoint == subscription_in.endpoint
    ).first()
    
    if existing:
        # ユーザーが違う場合は所有権を更新
        existing.user_id = current_user.id
        existing.p256dh = subscription_in.p256dh
        existing.auth = subscription_in.auth
        existing.user_agent = subscription_in.user_agent
        db.commit()
        db.refresh(existing)
        return existing

    new_sub = PushSubscription(
        user_id=current_user.id,
        endpoint=subscription_in.endpoint,
        p256dh=subscription_in.p256dh,
        auth=subscription_in.auth,
        user_agent=subscription_in.user_agent
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

@router.post("/unsubscribe")
def unsubscribe(
    endpoint: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subscription = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint,
        PushSubscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(subscription)
    db.commit()
    return {"message": "Unsubscribed successfully"}

@router.get("/settings", response_model=NotificationSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(NotificationSetting).filter(
        NotificationSetting.user_id == current_user.id
    ).first()
    
    if not settings:
        # デフォルト設定を作成
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.patch("/settings", response_model=NotificationSettingsResponse)
def update_settings(
    settings_in: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(NotificationSetting).filter(
        NotificationSetting.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)

    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

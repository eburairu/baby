from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.notification import PushSubscription, NotificationSetting, AppNotification
from app.schemas.notification import (
    AppNotificationResponse,
    UnreadCountResponse,
    PushSubscriptionCreate,
    PushSubscriptionResponse,
    NotificationSettingsResponse,
    NotificationSettingsUpdate,
)

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# ---- アプリ内通知センター ----

@router.get("", response_model=List[AppNotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """最新20件の通知を返す"""
    notifications = (
        db.query(AppNotification)
        .filter(AppNotification.user_id == current_user.id)
        .order_by(AppNotification.created_at.desc())
        .limit(20)
        .all()
    )
    return notifications


@router.get("/unread-count", response_model=UnreadCountResponse)
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """未読通知数を返す"""
    count = (
        db.query(AppNotification)
        .filter(
            AppNotification.user_id == current_user.id,
            AppNotification.is_read == False,  # noqa: E712
        )
        .count()
    )
    return UnreadCountResponse(count=count)


@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """個別通知を既読にする"""
    notification = db.query(AppNotification).filter(
        AppNotification.id == notification_id,
        AppNotification.user_id == current_user.id,
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """全通知を一括既読にする"""
    db.query(AppNotification).filter(
        AppNotification.user_id == current_user.id,
        AppNotification.is_read == False,  # noqa: E712
    ).update({"is_read": True})
    db.commit()


# ---- PWA プッシュ通知 ----

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


@router.post("/test")
def send_test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """テスト通知を自分自身に送信する"""
    from app.utils.notifications import send_push_notification

    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id
    ).all()

    if not subscriptions:
        return {
            "success": False,
            "message": "プッシュ通知の購読が見つかりません。通知設定ページで通知を有効にしてください。",
            "subscription_count": 0,
            "results": []
        }

    results = []
    for sub in subscriptions:
        success = send_push_notification(
            sub,
            title="テスト通知 🔔",
            body="プッシュ通知が正常に動作しています！",
            url="/settings/notifications",
            db=db
        )
        results.append({
            "subscription_id": sub.id,
            "endpoint_preview": sub.endpoint[:60] + "...",
            "success": success
        })

    all_success = all(r["success"] for r in results)
    return {
        "success": all_success,
        "message": "テスト通知を送信しました" if all_success else "一部の送信に失敗しました。サーバーログを確認してください。",
        "subscription_count": len(subscriptions),
        "results": results
    }

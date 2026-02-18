import os
import json
import logging
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from app.models.notification import PushSubscription, NotificationSetting
from datetime import datetime, time

logger = logging.getLogger(__name__)

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIM_EMAIL = os.getenv("VAPID_CLAIM_EMAIL", "admin@example.com")

def is_within_dnd(settings: NotificationSetting) -> bool:
    """おやすみモード内かどうかを判定する"""
    if not settings.dnd_start_time or not settings.dnd_end_time:
        return False
    
    now = datetime.now().time()
    start = settings.dnd_start_time
    end = settings.dnd_end_time
    
    if start <= end:
        return start <= now <= end
    else: # 日を跨ぐ場合 (例: 22:00 - 07:00)
        return now >= start or now <= end

def send_push_notification(subscription: PushSubscription, title: str, body: str, url: str = "/", db: Session | None = None):
    """特定の購読に対してプッシュ通知を送信する"""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        logger.warning("VAPID keys not configured. Skipping push notification.")
        return False

    try:
        payload = {
            "title": title,
            "body": body,
            "url": url
        }
        
        logger.info(f"Sending push notification to subscription id={subscription.id}, endpoint={subscription.endpoint[:60]}...")
        
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth
                }
            },
            data=json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": VAPID_CLAIM_EMAIL if VAPID_CLAIM_EMAIL.startswith("mailto:") else f"mailto:{VAPID_CLAIM_EMAIL}"
            }
        )
        logger.info(f"Push notification sent successfully to subscription id={subscription.id}")
        return True
    except WebPushException as ex:
        status_code = None
        response_body = None
        if hasattr(ex, 'response') and ex.response is not None:
            status_code = ex.response.status_code
            try:
                response_body = ex.response.text
            except Exception:
                response_body = str(ex.response.content) if hasattr(ex.response, 'content') else None
        logger.error(
            f"Web Push error for subscription id={subscription.id}: {ex} | "
            f"status_code={status_code} | response_body={response_body}"
        )
        # 410 Gone or 404 Not Found: 購読が無効なのでDBから削除
        if status_code in (410, 404) and db is not None:
            logger.info(f"Removing invalid subscription id={subscription.id} (status={status_code})")
            try:
                db.delete(subscription)
                db.commit()
            except Exception as delete_ex:
                logger.error(f"Failed to delete invalid subscription: {delete_ex}")
                db.rollback()
        return False
    except Exception as ex:
        logger.error(f"Unexpected error sending push to subscription id={subscription.id}: {type(ex).__name__}: {ex}")
        return False

def notify_user(db: Session, user_id: int, title: str, body: str, url: str = "/", category: str = "system"):
    """ユーザーの全デバイスに通知を送信する（設定を確認した上で）"""
    settings = db.query(NotificationSetting).filter(NotificationSetting.user_id == user_id).first()
    if not settings:
        # 設定がない場合はデフォルト設定を自動作成（family_record_enabled=True がデフォルト）
        logger.info(f"No notification settings for user {user_id}, creating defaults")
        settings = NotificationSetting(user_id=user_id)
        db.add(settings)
        try:
            db.commit()
            db.refresh(settings)
        except Exception as ex:
            logger.error(f"Failed to create default notification settings for user {user_id}: {ex}")
            db.rollback()
            return
    else:
        # カテゴリごとのON/OFF確認
        enabled_map = {
            "family_record": settings.family_record_enabled,
            "feeding_reminder": settings.feeding_reminder_enabled,
            "diaper_reminder": settings.diaper_reminder_enabled,
            "daily_summary": settings.daily_summary_enabled,
            "system": settings.system_notice_enabled
        }
        if not enabled_map.get(category, True):
            logger.info(f"Skipping {category} notification for user {user_id}: category disabled")
            return

        # おやすみモード確認
        if is_within_dnd(settings):
            logger.info(f"Skipping notification for user {user_id} due to DND.")
            return

    subscriptions = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
    logger.info(f"Sending {category} notification to user {user_id}: {len(subscriptions)} subscription(s) found")
    if not subscriptions:
        logger.warning(f"No push subscriptions found for user {user_id}")
        return
    for sub in subscriptions:
        send_push_notification(sub, title, body, url, db=db)

def notify_family_members(db: Session, family_id: int, exclude_user_id: int, title: str, body: str, url: str = "/", category: str = "family_record"):
    """家族メンバー全員（本人を除く）に通知を送信する"""
    from app.models.family import FamilyUser
    
    members = db.query(FamilyUser).filter(
        FamilyUser.family_id == family_id,
        FamilyUser.user_id != exclude_user_id
    ).all()
    
    logger.info(f"Notifying {len(members)} family member(s) in family {family_id} (excluding user {exclude_user_id})")
    
    for member in members:
        notify_user(db, member.user_id, title, body, url, category)


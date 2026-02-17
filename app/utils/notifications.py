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

def send_push_notification(subscription: PushSubscription, title: str, body: str, url: str = "/"):
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
                "sub": f"mailto:{VAPID_CLAIM_EMAIL}"
            }
        )
        return True
    except WebPushException as ex:
        logger.error(f"Web Push error: {ex}")
        # 410 Gone または 404 Not Found の場合は購読が無効なので削除を検討すべきだが、
        # ここではログ出力に留め、呼び出し側で処理するか検討する。
        return False
    except Exception as ex:
        logger.error(f"Unexpected error sending push: {ex}")
        return False

def notify_user(db: Session, user_id: int, title: str, body: str, url: str = "/", category: str = "system"):
    """ユーザーの全デバイスに通知を送信する（設定を確認した上で）"""
    settings = db.query(NotificationSetting).filter(NotificationSetting.user_id == user_id).first()
    if not settings:
        # 設定がない場合はデフォルト（システム通知のみON等）
        if category != "system":
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
            return

        # おやすみモード確認
        if is_within_dnd(settings):
            logger.info(f"Skipping notification for user {user_id} due to DND.")
            return

    subscriptions = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
    for sub in subscriptions:
        send_push_notification(sub, title, body, url)

def notify_family_members(db: Session, family_id: int, exclude_user_id: int, title: str, body: str, url: str = "/", category: str = "family_record"):
    """家族メンバー全員（本人を除く）に通知を送信する"""
    from app.models.family import FamilyUser
    
    members = db.query(FamilyUser).filter(
        FamilyUser.family_id == family_id,
        FamilyUser.user_id != exclude_user_id
    ).all()
    
    for member in members:
        notify_user(db, member.user_id, title, body, url, category)

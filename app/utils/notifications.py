import os
import json
import logging
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from app.models.notification import AppNotification, PushSubscription, NotificationSetting
from datetime import datetime, time
from app.utils.timezone import get_jst_now, JST
from fastapi import BackgroundTasks
from app.database import SessionLocal

logger = logging.getLogger(__name__)

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIM_EMAIL = os.getenv("VAPID_CLAIM_EMAIL", "admin@example.com")

def is_within_dnd(settings: NotificationSetting) -> bool:
    """おやすみモード内かどうかを判定する"""
    if not settings.dnd_start_time or not settings.dnd_end_time:
        return False

    now = get_jst_now().time()
    start = settings.dnd_start_time
    end = settings.dnd_end_time

    if start <= end:
        return start <= now <= end
    else: # 日を跨ぐ場合 (例: 22:00 - 07:00)
        return now >= start or now <= end

def send_push_notification(subscription: PushSubscription, title: str, body: str, url: str = "/", db: Session | None = None) -> dict:
    """特定の購読に対してプッシュ通知を送信する"""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        logger.warning("VAPID keys not configured. Skipping push notification.")
        return {"success": False, "status_code": None, "error": "VAPID keys not configured"}

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
        return {"success": True, "status_code": None, "error": None}
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
        return {"success": False, "status_code": status_code, "error": str(ex)}
    except Exception as ex:
        error_msg = f"{type(ex).__name__}: {ex}"
        logger.error(f"Unexpected error sending push to subscription id={subscription.id}: {error_msg}")
        return {"success": False, "status_code": None, "error": error_msg}


# category → notification_settings カラムのマッピング
_CATEGORY_SETTING_MAP: dict[str, str] = {
    "family_record": "family_record_enabled",
    "comment": "family_record_enabled",  # comment も family_record 設定に従う
    "feeding_reminder": "feeding_reminder_enabled",
    "diaper_reminder": "diaper_reminder_enabled",
    "daily_summary": "daily_summary_enabled",
    "system": "system_notice_enabled",
    "achievement": "family_record_enabled",  # 実績通知は family_record 設定に従う
}


def notify_user(db: Session, user_id: int, title: str, body: str, url: str = "/", category: str = "system"):
    """
    ユーザーに通知を送信する。

    1. notification_settings でカテゴリの ON/OFF を確認
    2. app_notifications テーブルに INSERT（おやすみモードに関係なく常時）
    3. おやすみモード中でなければ PWA プッシュ通知も送信
    """
    settings = db.query(NotificationSetting).filter(NotificationSetting.user_id == user_id).first()
    if not settings:
        # 設定がない場合はデフォルト設定を自動作成（全カテゴリ有効がデフォルト）
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

    # カテゴリごとの ON/OFF 確認（オフなら app_notifications にも INSERT しない）
    setting_col = _CATEGORY_SETTING_MAP.get(category)
    if setting_col and not getattr(settings, setting_col, True):
        logger.info(f"Skipping {category} notification for user {user_id}: category disabled")
        return

    # ① アプリ内通知センターへの INSERT（時間帯に関係なく常に行う）
    app_notif = AppNotification(
        user_id=user_id,
        type=category,
        title=title,
        body=body,
        url=url,
    )
    db.add(app_notif)
    try:
        db.commit()
    except Exception as ex:
        logger.error(f"Failed to insert app_notification for user {user_id}: {ex}")
        db.rollback()
        return

    # ② おやすみモード確認（プッシュ通知のみスキップ）
    if is_within_dnd(settings):
        logger.info(f"Skipping push notification for user {user_id} due to DND.")
        return

    # ③ PWA プッシュ通知を全デバイスに送信
    subscriptions = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
    logger.info(f"Sending {category} push to user {user_id}: {len(subscriptions)} subscription(s)")
    for sub in subscriptions:
        # 戻り値を無視して続行（副作用のみのため）
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


def notify_family_members_bg(background_tasks: BackgroundTasks, family_id: int, exclude_user_id: int, title: str, body: str, url: str = "/", category: str = "family_record"):
    """家族メンバー全員（本人を除く）に通知を送信する（バックグラウンドタスク）"""
    def _task():
        db = SessionLocal()
        try:
            notify_family_members(db, family_id, exclude_user_id, title, body, url, category)
        finally:
            db.close()

    background_tasks.add_task(_task)


def notify_achievements_bg(
    background_tasks: BackgroundTasks,
    family_id: int,
    baby_name: str,
    baby_id: int,
    unlocked: list[dict],
) -> None:
    """実績解除を家族全員（全員）に通知する（バックグラウンドタスク）"""
    def _task():
        db = SessionLocal()
        try:
            for a in unlocked:
                notify_family_members(
                    db,
                    family_id,
                    exclude_user_id=0,  # 全員に通知
                    title=f"実績解除！{a['icon']} {a['name']}",
                    body=f"{baby_name}が「{a['name']}」を達成しました！",
                    url=f"/dashboard?baby_id={baby_id}",
                    category="achievement",
                )
        finally:
            db.close()

    background_tasks.add_task(_task)

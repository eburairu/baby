import os
import json
import logging
from datetime import datetime, time
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.notification import PushSubscription, NotificationSetting
from app.utils.notifications import send_push_notification, is_within_dnd

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def debug_notifications():
    db: Session = SessionLocal()
    try:
        username = os.getenv("TEST_USER_USERNAME", "testuser")
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            print(f"User {username} not found. Please run seed_test_user.py first.")
            return

        print(f"--- Debugging Notifications for user: {user.username} (ID: {user.id}) ---")

        # 1. Check Notification Settings
        settings = db.query(NotificationSetting).filter(NotificationSetting.user_id == user.id).first()
        if not settings:
            print("No NotificationSetting found. Creating defaults...")
            settings = NotificationSetting(user_id=user.id)
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        print(f"Settings: family_record={settings.family_record_enabled}, system={settings.system_notice_enabled}")
        print(f"DND: {settings.dnd_start_time} - {settings.dnd_end_time}")
        
        # 2. Check DND status
        within_dnd = is_within_dnd(settings)
        now_time = datetime.now().time()
        print(f"Current server time: {now_time}")
        print(f"Is within DND? {within_dnd}")

        # 3. Check Subscriptions
        subs = db.query(PushSubscription).filter(PushSubscription.user_id == user.id).all()
        print(f"Number of subscriptions: {len(subs)}")
        
        if not subs:
            print("Adding a mock subscription for testing...")
            # Use valid looking endpoint/auth/p256dh (even if it's fake)
            mock_sub = PushSubscription(
                user_id=user.id,
                endpoint="https://fcm.googleapis.com/fcm/send/fake-endpoint-12345",
                p256dh="BLm9_2_L_fG7z7vPz_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p7v_p",
                auth="fake-auth-1234567890",
                user_agent="Mock User Agent"
            )
            db.add(mock_sub)
            db.commit()
            db.refresh(mock_sub)
            subs = [mock_sub]

        # 4. Try sending a test push (manual call)
        print("\n--- Attempting to send mock push notification ---")
        for sub in subs:
            print(f"Sending to subscription ID: {sub.id}, endpoint: {sub.endpoint[:40]}...")
            success = send_push_notification(
                sub,
                title="Debug Test 🔔",
                body="Testing backend notification logic...",
                url="/settings/notifications",
                db=db
            )
            print(f"Send success? {success}")

    finally:
        db.close()

if __name__ == "__main__":
    debug_notifications()

"""通知機能のユニットテスト"""
import pytest
from unittest.mock import patch, MagicMock
from app.utils.notifications import send_push_notification, notify_user, notify_family_members, is_within_dnd
from app.models.notification import PushSubscription, NotificationSetting
from datetime import time, datetime, timezone, timedelta


JST = timezone(timedelta(hours=9))


class TestIsWithinDnd:
    def test_no_dnd_times(self):
        settings = MagicMock(spec=NotificationSetting)
        settings.dnd_start_time = None
        settings.dnd_end_time = None
        assert is_within_dnd(settings) is False

    def test_dnd_start_only(self):
        settings = MagicMock(spec=NotificationSetting)
        settings.dnd_start_time = time(22, 0)
        settings.dnd_end_time = None
        assert is_within_dnd(settings) is False

    def test_dnd_uses_jst_not_utc(self):
        """DND判定はJST時刻で行う（UTC時刻で判定するバグの回帰テスト）"""
        settings = MagicMock(spec=NotificationSetting)
        # ユーザーがJSTで「夜21時〜朝8時」をDNDに設定
        settings.dnd_start_time = time(21, 0)
        settings.dnd_end_time = time(8, 0)

        # UTC 03:00 = JST 12:00（昼）→ DND外のはず
        utc_03 = datetime(2026, 1, 1, 3, 0, 0, tzinfo=timezone.utc)
        jst_time = utc_03.astimezone(JST)
        with patch("app.utils.notifications.datetime") as mock_dt:
            mock_dt.now.return_value = jst_time
            result = is_within_dnd(settings)
        assert result is False, "JST 12:00（昼）はDND外のはず（UTC 03:00 を誤ってDNDと判定するバグの確認）"

    def test_dnd_active_at_night_jst(self):
        """JSTの夜22時はDND内と判定される"""
        settings = MagicMock(spec=NotificationSetting)
        settings.dnd_start_time = time(21, 0)
        settings.dnd_end_time = time(8, 0)

        # UTC 13:00 = JST 22:00（夜）→ DND内
        utc_13 = datetime(2026, 1, 1, 13, 0, 0, tzinfo=timezone.utc)
        jst_time = utc_13.astimezone(JST)
        with patch("app.utils.notifications.datetime") as mock_dt:
            mock_dt.now.return_value = jst_time
            result = is_within_dnd(settings)
        assert result is True, "JST 22:00（夜）はDND内のはず"


class TestSendPushNotification:
    @patch.dict("os.environ", {"VAPID_PRIVATE_KEY": "", "VAPID_PUBLIC_KEY": ""})
    def test_skip_when_no_vapid_keys(self):
        """VAPID鍵がない場合は通知を送信しない"""
        from app.utils import notifications
        old_priv = notifications.VAPID_PRIVATE_KEY
        old_pub = notifications.VAPID_PUBLIC_KEY
        notifications.VAPID_PRIVATE_KEY = None
        notifications.VAPID_PUBLIC_KEY = None
        
        sub = MagicMock(spec=PushSubscription)
        result = send_push_notification(sub, "Test", "Body")
        assert result == {"success": False, "status_code": None, "error": "VAPID keys not configured"}

        notifications.VAPID_PRIVATE_KEY = old_priv
        notifications.VAPID_PUBLIC_KEY = old_pub

    @patch("app.utils.notifications.webpush")
    def test_successful_send(self, mock_webpush):
        """正常に通知が送信される場合"""
        from app.utils import notifications
        old_priv = notifications.VAPID_PRIVATE_KEY
        old_pub = notifications.VAPID_PUBLIC_KEY
        notifications.VAPID_PRIVATE_KEY = "test_private_key"
        notifications.VAPID_PUBLIC_KEY = "test_public_key"
        
        sub = MagicMock(spec=PushSubscription)
        sub.id = 1
        sub.endpoint = "https://example.com/push/123"
        sub.p256dh = "test_p256dh"
        sub.auth = "test_auth"
        
        result = send_push_notification(sub, "Test Title", "Test Body")
        assert result["success"] is True
        mock_webpush.assert_called_once()
        
        notifications.VAPID_PRIVATE_KEY = old_priv
        notifications.VAPID_PUBLIC_KEY = old_pub

    @patch("app.utils.notifications.webpush")
    def test_cleans_up_410_subscription(self, mock_webpush):
        """410レスポンスの場合、購読をDBから削除する"""
        from pywebpush import WebPushException
        from app.utils import notifications
        old_priv = notifications.VAPID_PRIVATE_KEY
        old_pub = notifications.VAPID_PUBLIC_KEY
        notifications.VAPID_PRIVATE_KEY = "test_private_key"
        notifications.VAPID_PUBLIC_KEY = "test_public_key"
        
        response_mock = MagicMock()
        response_mock.status_code = 410
        response_mock.text = "Gone"
        
        ex = WebPushException("Gone")
        ex.response = response_mock
        mock_webpush.side_effect = ex
        
        sub = MagicMock(spec=PushSubscription)
        sub.id = 1
        sub.endpoint = "https://example.com/push/123"
        sub.p256dh = "test_p256dh"
        sub.auth = "test_auth"
        
        db = MagicMock()
        result = send_push_notification(sub, "Test", "Body", db=db)
        
        assert result["success"] is False
        assert result["status_code"] == 410
        db.delete.assert_called_once_with(sub)
        db.commit.assert_called_once()
        
        notifications.VAPID_PRIVATE_KEY = old_priv
        notifications.VAPID_PUBLIC_KEY = old_pub


class TestNotifyUser:
    def test_auto_creates_settings_for_new_user(self):
        """設定がないユーザーにはデフォルト設定を自動作成する"""
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        db.query.return_value.filter.return_value.all.return_value = []  # no subscriptions
        
        notify_user(db, 1, "Test", "Body", category="family_record")
        # デフォルト設定が作成されることを確認
        db.add.assert_called_once()

    def test_skip_disabled_category(self):
        """無効なカテゴリの通知はスキップ"""
        settings = MagicMock(spec=NotificationSetting)
        settings.family_record_enabled = False
        settings.dnd_start_time = None
        settings.dnd_end_time = None
        
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = settings
        
        notify_user(db, 1, "Test", "Body", category="family_record")


class TestNotifyFamilyMembers:
    def test_excludes_sender(self):
        """通知送信者（自分自身）は除外される"""
        db = MagicMock()
        
        # FamilyUserクエリのモック
        member = MagicMock()
        member.user_id = 2
        db.query.return_value.filter.return_value.all.return_value = [member]
        
        # notify_userをモック
        with patch("app.utils.notifications.notify_user") as mock_notify:
            notify_family_members(db, 1, 1, "Test", "Body")
            mock_notify.assert_called_once_with(db, 2, "Test", "Body", "/", "family_record")


class TestTestNotificationEndpoint:
    def test_test_endpoint(self, client, auth_client):
        """テスト通知エンドポイントが存在することを確認"""
        c = auth_client()
        response = c.post("/api/notifications/test")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "subscription_count" in data

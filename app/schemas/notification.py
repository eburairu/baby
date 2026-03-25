from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime, time
from enum import Enum
from urllib.parse import urlparse
from app.models.enums import NotificationType

# Web Push サービスの許可ドメイン（完全ホスト名一致）
ALLOWED_PUSH_ENDPOINT_HOSTS = {
    "fcm.googleapis.com",
    "push.services.mozilla.com",
    "web.push.apple.com",
}


class AppNotificationResponse(BaseModel):
    id: int
    type: NotificationType
    title: str
    body: Optional[str] = None
    url: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    count: int


# ---- PWA プッシュ通知 ----

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    user_agent: Optional[str] = None

    @field_validator("endpoint")
    @classmethod
    def validate_endpoint(cls, v: str) -> str:
        parsed = urlparse(v)
        if parsed.scheme != "https":
            raise ValueError("endpoint must use HTTPS")
        host = parsed.hostname or ""
        if host not in ALLOWED_PUSH_ENDPOINT_HOSTS:
            raise ValueError(
                f"endpoint host '{host}' is not an allowed push service. "
                f"Allowed: {sorted(ALLOWED_PUSH_ENDPOINT_HOSTS)}"
            )
        return v


class PushSubscriptionResponse(BaseModel):
    id: int
    endpoint: str
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationSettingsResponse(BaseModel):
    family_record_enabled: bool
    feeding_reminder_enabled: bool
    diaper_reminder_enabled: bool
    daily_summary_enabled: bool
    system_notice_enabled: bool
    dnd_start_time: Optional[time] = None
    dnd_end_time: Optional[time] = None

    model_config = {"from_attributes": True}


class NotificationSettingsUpdate(BaseModel):
    family_record_enabled: Optional[bool] = None
    feeding_reminder_enabled: Optional[bool] = None
    diaper_reminder_enabled: Optional[bool] = None
    daily_summary_enabled: Optional[bool] = None
    system_notice_enabled: Optional[bool] = None
    dnd_start_time: Optional[time] = None
    dnd_end_time: Optional[time] = None

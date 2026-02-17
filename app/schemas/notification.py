from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, time

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    user_agent: Optional[str] = None

class PushSubscriptionResponse(BaseModel):
    id: int
    endpoint: str
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationSettingsResponse(BaseModel):
    family_record_enabled: bool
    feeding_reminder_enabled: bool
    diaper_reminder_enabled: bool
    daily_summary_enabled: bool
    system_notice_enabled: bool
    dnd_start_time: Optional[time] = None
    dnd_end_time: Optional[time] = None

    class Config:
        from_attributes = True

class NotificationSettingsUpdate(BaseModel):
    family_record_enabled: Optional[bool] = None
    feeding_reminder_enabled: Optional[bool] = None
    diaper_reminder_enabled: Optional[bool] = None
    daily_summary_enabled: Optional[bool] = None
    system_notice_enabled: Optional[bool] = None
    dnd_start_time: Optional[time] = None
    dnd_end_time: Optional[time] = None

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Time, Text, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class AppNotification(Base):
    __tablename__ = "app_notifications"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    # 'family_record' | 'comment' | 'daily_summary'
    # | 'feeding_reminder' | 'diaper_reminder' | 'system'
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    url = Column(String(512), nullable=True)
    is_read = Column(Boolean, nullable=False, server_default="false", default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="app_notifications")


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    endpoint = Column(String, nullable=False)
    p256dh = Column(String, nullable=False)
    auth = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="push_subscriptions")

class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, nullable=False)
    family_record_enabled = Column(Boolean, server_default="true", nullable=False, default=True)
    feeding_reminder_enabled = Column(Boolean, server_default="false", nullable=False, default=False)
    diaper_reminder_enabled = Column(Boolean, server_default="false", nullable=False, default=False)
    daily_summary_enabled = Column(Boolean, server_default="true", nullable=False, default=True)
    system_notice_enabled = Column(Boolean, server_default="true", nullable=False, default=True)
    dnd_start_time = Column(Time, nullable=True)
    dnd_end_time = Column(Time, nullable=True)
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="notification_setting", uselist=False)

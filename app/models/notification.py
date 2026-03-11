from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Time, Text, func, Index
from sqlalchemy.orm import relationship
from app.models.base import Base, SoftDeleteMixin


class AppNotification(Base, SoftDeleteMixin):
    """アプリ内通知センター用テーブル"""
    __tablename__ = "app_notifications"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # references NotificationType enum
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    url = Column(String(512), nullable=True)
    is_read = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="app_notifications")

    __table_args__ = (
        # Optimize fetch list notifications ordered by time
        Index("idx_app_notifications_user_created", "user_id", "created_at"),
        # Optimize count unread notifications (existing index from 0332ddd5a74c)
        Index("idx_app_notifications_user_unread", "user_id", "is_read", "created_at"),
        Index("ix_app_notifications_user_id_is_deleted", "user_id", "is_deleted"),
    )


class PushSubscription(Base, SoftDeleteMixin):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    endpoint = Column(String, nullable=False)
    p256dh = Column(String, nullable=False)
    auth = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="push_subscriptions")

    __table_args__ = (
        Index("ix_push_subscriptions_user_id_is_deleted", "user_id", "is_deleted"),
    )

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
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="notification_setting", uselist=False)

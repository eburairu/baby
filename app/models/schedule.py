from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, func, Index
from .base import Base, SoftDeleteMixin


class Schedule(Base, SoftDeleteMixin):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=False, index=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_schedule_baby_scheduled_time", "baby_id", "scheduled_time"),
        Index("ix_schedules_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

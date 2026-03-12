from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from .base import Base, SoftDeleteMixin, TimestampMixin


class Sleep(Base, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "sleeps"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_sleep_baby_start_time", "baby_id", "start_time"),
        Index("ix_sleeps_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

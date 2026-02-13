from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, func
from .base import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    scheduled_time = Column(DateTime, nullable=False, index=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

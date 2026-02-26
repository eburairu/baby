from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from .base import Base


class Sleep(Base):
    __tablename__ = "sleeps"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_sleep_baby_start_time", "baby_id", "start_time"),
    )

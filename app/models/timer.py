from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from .base import Base


class ContractionTimerState(Base):
    __tablename__ = "contraction_timer_states"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(String, nullable=False, default="idle")  # "idle" | "timing"
    start_time = Column(DateTime, nullable=True)  # タイマー開始時刻（UTC）


class FeedingTimerState(Base):
    __tablename__ = "feeding_timer_states"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False, unique=True)
    active_side = Column(String, nullable=True)   # "LEFT" | "RIGHT" | null
    left_elapsed_seconds = Column(Integer, nullable=False, default=0)
    right_elapsed_seconds = Column(Integer, nullable=False, default=0)
    segment_start_time = Column(DateTime, nullable=True)  # 現在の区間開始時刻（UTC）

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from .base import Base, SoftDeleteMixin


class Contraction(Base, SoftDeleteMixin):
    __tablename__ = "contractions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    interval_seconds = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False, index=True)

    __table_args__ = (
        Index("idx_contraction_baby_start_time", "baby_id", "start_time"),
        Index("ix_contractions_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from .base import Base

class Note(Base):
    __tablename__ = "notes"

    __table_args__ = (
        Index("idx_note_baby_time", "baby_id", "note_time"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    note_time = Column(DateTime, nullable=False, server_default=func.now(), index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

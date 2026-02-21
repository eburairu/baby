from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Boolean, func
from sqlalchemy.orm import relationship
from .base import Base


class RecordComment(Base):
    __tablename__ = "record_comments"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    record_type = Column(String, nullable=False)  # feeding, sleep, diaper, etc.
    record_id = Column(Integer, nullable=False)   # ID in the respective table
    content = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_ai_generated = Column(Boolean, nullable=False, default=False)
    ai_has_concern = Column(Boolean, nullable=True)

    # Relationships
    baby = relationship("Baby", backref="record_comments")
    user = relationship("User", backref="record_comments")

    __table_args__ = (
        Index("idx_comment_record", "record_type", "record_id"),
    )

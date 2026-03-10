from sqlalchemy import Column, Integer, String, ForeignKey, Date, JSON, Index
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, SoftDeleteMixin

class Milestone(Base, SoftDeleteMixin):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    milestone_type = Column(String, nullable=False)  # e.g., "rolling_over" or "custom"
    title = Column(String, nullable=False)
    achieved_date = Column(Date, nullable=False, index=True)
    
    image_urls = Column(JSON().with_variant(JSONB, 'postgresql'), nullable=False, default=[])
    notes = Column(String, nullable=True)

    __table_args__ = (
        Index("idx_milestone_baby_achieved", "baby_id", "achieved_date"),
        Index("ix_milestones_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

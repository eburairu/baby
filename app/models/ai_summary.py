from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, UniqueConstraint, Index, JSON, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.sql import func
from .base import Base, SoftDeleteMixin, _utcnow


class DailySummary(Base, SoftDeleteMixin):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    summary_date = Column(Date, nullable=False)
    generated_content = Column(Text, nullable=False)
    edited_content = Column(Text, nullable=True)
    is_edited = Column(Boolean, nullable=False, default=False)
    model_name = Column(String, nullable=True)
    image_urls = Column(MutableList.as_mutable(JSON().with_variant(JSONB, 'postgresql')), nullable=True, default=[])
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=_utcnow)

    __table_args__ = (
        Index(
            "uix_daily_summary_baby_date_partial",
            "baby_id",
            "summary_date",
            unique=True,
            postgresql_where=text("is_deleted = false")
        ),
        Index("ix_daily_summaries_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Float, Enum, Index
from .base import Base, SoftDeleteMixin, TimestampMixin
from app.models.enums import FeedingType, BreastSide, BottleContentType, FeedingCompletion


class Feeding(Base, SoftDeleteMixin, TimestampMixin):
    __tablename__ = "feedings"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    feeding_time = Column(DateTime(timezone=True), nullable=False, index=True)
    feeding_type = Column(Enum(FeedingType, name="feedingtype"), nullable=False)
    amount_ml = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    # Phase 1: 左右別授乳時間・最終授乳側
    left_breast_minutes = Column(Integer, nullable=True)
    right_breast_minutes = Column(Integer, nullable=True)
    last_breast_side = Column(Enum(BreastSide, name="breastside"), nullable=True)

    # Phase 2: ボトルコンテンツタイプ・授乳完全度
    bottle_content_type = Column(Enum(BottleContentType, name="bottlecontenttype"), nullable=True)
    feeding_completion = Column(Enum(FeedingCompletion, name="feedingcompletion"), nullable=True)

    # Phase 3: ゲップの有無
    burped = Column(Boolean, nullable=True)

    __table_args__ = (
        Index("idx_feeding_baby_time", "baby_id", "feeding_time"),
        Index("ix_feedings_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

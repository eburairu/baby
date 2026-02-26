import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum, Index
from .base import Base


class FeedingType(str, enum.Enum):
    BREAST = "BREAST"
    BOTTLE = "BOTTLE"
    MIXED = "MIXED"


class BreastSide(str, enum.Enum):
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    BOTH = "BOTH"


class BottleContentType(str, enum.Enum):
    FORMULA = "FORMULA"
    EXPRESSED_MILK = "EXPRESSED_MILK"
    MIXED = "MIXED"


class FeedingCompletion(str, enum.Enum):
    FULL = "FULL"
    PARTIAL = "PARTIAL"


class Feeding(Base):
    __tablename__ = "feedings"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    feeding_time = Column(DateTime, nullable=False, index=True)
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

    __table_args__ = (
        Index("idx_feeding_baby_time", "baby_id", "feeding_time"),
    )

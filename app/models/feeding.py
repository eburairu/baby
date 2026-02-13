import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum, Index
from .base import Base


class FeedingType(str, enum.Enum):
    BREAST = "BREAST"
    BOTTLE = "BOTTLE"
    MIXED = "MIXED"


class Feeding(Base):
    __tablename__ = "feedings"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feeding_time = Column(DateTime, nullable=False, index=True)
    feeding_type = Column(Enum(FeedingType, name="feedingtype"), nullable=False)
    amount_ml = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_feeding_baby_time", "baby_id", "feeding_time"),
    )

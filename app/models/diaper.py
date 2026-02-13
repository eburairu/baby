import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Index
from .base import Base


class DiaperType(str, enum.Enum):
    WET = "WET"
    DIRTY = "DIRTY"
    BOTH = "BOTH"


class Diaper(Base):
    __tablename__ = "diapers"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    change_time = Column(DateTime, nullable=False, index=True)
    diaper_type = Column(Enum(DiaperType, name="diapertype"), nullable=False)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_diaper_baby_time", "baby_id", "change_time"),
    )

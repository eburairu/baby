from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Index
from .base import Base, SoftDeleteMixin
from app.models.enums import DiaperType


class Diaper(Base, SoftDeleteMixin):
    __tablename__ = "diapers"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    change_time = Column(DateTime(timezone=True), nullable=False, index=True)
    diaper_type = Column(Enum(DiaperType, name="diapertype"), nullable=False)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_diaper_baby_time", "baby_id", "change_time"),
        Index("ix_diapers_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

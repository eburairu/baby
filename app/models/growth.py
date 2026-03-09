from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Index
from .base import Base, SoftDeleteMixin


class Growth(Base, SoftDeleteMixin):
    __tablename__ = "growths"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    weight = Column(Integer, nullable=True)  # in grams
    height = Column(Float, nullable=True)  # in cm
    head_circumference = Column(Float, nullable=True)  # in cm
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

    __table_args__ = (
        Index("idx_growth_baby_date", "baby_id", "date"),
        Index("ix_growths_baby_id_is_deleted", "baby_id", "is_deleted"),
    )

from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from .base import Base


class Growth(Base):
    __tablename__ = "growths"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    measurement_date = Column(Date, nullable=False, index=True)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    head_circumference_cm = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)

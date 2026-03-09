import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Index
from .base import Base


class TemperatureMethod(str, enum.Enum):
    AXILLARY = "AXILLARY"   # わきの下
    EAR = "EAR"             # 耳
    FOREHEAD = "FOREHEAD"   # 額
    RECTAL = "RECTAL"       # 直腸


class TemperatureRecord(Base):
    __tablename__ = "temperature_records"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)
    measured_at = Column(DateTime, nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    method = Column(
        Enum(TemperatureMethod, name="temperaturemethod"),
        nullable=False,
        default=TemperatureMethod.AXILLARY,
    )
    notes = Column(String, nullable=True)

    __table_args__ = (
        Index("idx_temperature_baby_time", "baby_id", "measured_at"),
    )

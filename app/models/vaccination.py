from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean, Enum as SQLEnum, Index
from .base import Base
import enum

class VaccinationStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    POSTPONED = "postponed"

class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    vaccine_name = Column(String, nullable=False)
    dose_number = Column(Integer, nullable=False)
    status = Column(SQLEnum(VaccinationStatus), nullable=False, default=VaccinationStatus.SCHEDULED)
    
    scheduled_date = Column(Date, nullable=False, index=True)
    completed_date = Column(Date, nullable=True)
    
    lot_number = Column(String, nullable=True)
    hospital_name = Column(String, nullable=True)
    has_side_effect = Column(Boolean, nullable=False, default=False)
    notes = Column(String, nullable=True)

    __table_args__ = (
        Index("idx_vaccination_baby_status", "baby_id", "status"),
    )

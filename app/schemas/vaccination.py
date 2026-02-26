from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from app.models.vaccination import VaccinationStatus

class VaccinationBase(BaseModel):
    vaccine_name: str
    dose_number: int
    status: VaccinationStatus = VaccinationStatus.SCHEDULED
    scheduled_date: date
    completed_date: Optional[date] = None
    lot_number: Optional[str] = None
    hospital_name: Optional[str] = None
    has_side_effect: bool = False
    notes: Optional[str] = None

class VaccinationCreate(VaccinationBase):
    pass

class VaccinationUpdate(BaseModel):
    status: Optional[VaccinationStatus] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    lot_number: Optional[str] = None
    hospital_name: Optional[str] = None
    has_side_effect: Optional[bool] = None
    notes: Optional[str] = None

class VaccinationResponse(VaccinationBase):
    id: int
    baby_id: int
    user_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

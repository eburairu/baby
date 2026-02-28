from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from typing import Optional, List
from app.models.vaccination import VaccinationStatus
from app.core.constants import NOTE_MAX_LENGTH

class VaccinationBase(BaseModel):
    vaccine_name: str = Field(..., max_length=100)
    dose_number: int
    status: VaccinationStatus = VaccinationStatus.SCHEDULED
    scheduled_date: date
    completed_date: Optional[date] = None
    lot_number: Optional[str] = Field(None, max_length=50)
    hospital_name: Optional[str] = Field(None, max_length=100)
    has_side_effect: bool = False
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

class VaccinationCreate(VaccinationBase):
    pass

class VaccinationUpdate(BaseModel):
    status: Optional[VaccinationStatus] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    lot_number: Optional[str] = Field(None, max_length=50)
    hospital_name: Optional[str] = Field(None, max_length=100)
    has_side_effect: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=NOTE_MAX_LENGTH)

class VaccinationResponse(VaccinationBase):
    id: int
    baby_id: int
    user_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

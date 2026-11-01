from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AvailableSlot(BaseModel):
    slot_start: datetime
    slot_end: datetime
    formatted_time: str
    is_available: bool = True

class AppointmentCreate(BaseModel):
    doctor_id: int
    slot_start: datetime
    notes: Optional[str] = None

class AppointmentReschedule(BaseModel):
    new_slot_start: datetime

class AppointmentCancel(BaseModel):
    reason: Optional[str] = None

class DoctorSimpleOut(BaseModel):
    id: int
    name: str
    specialization: str
    qualification: str
    consultation_fee: float
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PatientSimpleOut(BaseModel):
    id: int
    phone: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    slot_start: datetime
    slot_end: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime
    doctor: Optional[DoctorSimpleOut] = None
    patient: Optional[PatientSimpleOut] = None

    model_config = ConfigDict(from_attributes=True)

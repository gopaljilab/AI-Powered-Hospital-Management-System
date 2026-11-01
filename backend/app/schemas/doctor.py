from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import time, date

class ScheduleBase(BaseModel):
    weekday: int  # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    slot_duration: int = 30

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleOut(ScheduleBase):
    id: int
    doctor_id: int

    model_config = ConfigDict(from_attributes=True)

class ExceptionBase(BaseModel):
    date: date
    reason: Optional[str] = None

class ExceptionCreate(ExceptionBase):
    pass

class ExceptionOut(ExceptionBase):
    id: int
    doctor_id: int

    model_config = ConfigDict(from_attributes=True)

class DoctorBase(BaseModel):
    name: str
    qualification: str
    specialization: str
    experience: int
    consultation_fee: float
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    department_id: Optional[int] = None

class DoctorCreate(DoctorBase):
    email: str
    password: str

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    is_active: Optional[bool] = None
    department_id: Optional[int] = None

class DepartmentSimple(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class DoctorOut(DoctorBase):
    id: int
    user_id: int
    department: Optional[DepartmentSimple] = None
    schedules: List[ScheduleOut] = []
    exceptions: List[ExceptionOut] = []

    model_config = ConfigDict(from_attributes=True)

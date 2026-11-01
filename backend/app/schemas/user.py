from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class UserBase(BaseModel):
    name: str
    email: str

class UserRegister(UserBase):
    password: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class PatientProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    created_at: datetime
    patient_profile: Optional[PatientProfileOut] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

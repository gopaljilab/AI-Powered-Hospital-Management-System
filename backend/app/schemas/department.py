from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Activity"
    image_url: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    doctor_count: Optional[int] = 0

    class Config:
        from_attributes = True

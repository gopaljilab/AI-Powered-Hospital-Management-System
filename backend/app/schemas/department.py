from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)

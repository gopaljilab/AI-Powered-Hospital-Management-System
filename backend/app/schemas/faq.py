from pydantic import BaseModel
from typing import Optional

class FAQBase(BaseModel):
    question: str
    answer: str
    department_id: Optional[int] = None

class FAQCreate(FAQBase):
    pass

class FAQOut(FAQBase):
    id: int
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

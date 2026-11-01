from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    action: str
    entity: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    today_appointments: int
    pending_appointments: int
    confirmed_appointments: int
    cancelled_appointments: int
    completed_appointments: int
    department_stats: List[Dict[str, int]]
    recent_activity: List[AuditLogOut]

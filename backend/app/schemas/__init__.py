from app.schemas.user import (
    UserBase, UserRegister, UserLogin, UserOut, Token, TokenPayload, PatientProfileOut
)
from app.schemas.department import DepartmentBase, DepartmentCreate, DepartmentOut
from app.schemas.doctor import (
    DoctorBase, DoctorCreate, DoctorUpdate, DoctorOut,
    ScheduleBase, ScheduleCreate, ScheduleOut,
    ExceptionBase, ExceptionCreate, ExceptionOut
)
from app.schemas.appointment import (
    AvailableSlot, AppointmentCreate, AppointmentReschedule,
    AppointmentCancel, AppointmentOut
)
from app.schemas.faq import FAQBase, FAQCreate, FAQOut
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, ConversationOut, MessageOut
from app.schemas.admin import AuditLogOut, DashboardStats

__all__ = [
    "UserBase", "UserRegister", "UserLogin", "UserOut", "Token", "TokenPayload", "PatientProfileOut",
    "DepartmentBase", "DepartmentCreate", "DepartmentOut",
    "DoctorBase", "DoctorCreate", "DoctorUpdate", "DoctorOut",
    "ScheduleBase", "ScheduleCreate", "ScheduleOut",
    "ExceptionBase", "ExceptionCreate", "ExceptionOut",
    "AvailableSlot", "AppointmentCreate", "AppointmentReschedule",
    "AppointmentCancel", "AppointmentOut",
    "FAQBase", "FAQCreate", "FAQOut",
    "ChatMessageRequest", "ChatMessageResponse", "ConversationOut", "MessageOut",
    "AuditLogOut", "DashboardStats"
]

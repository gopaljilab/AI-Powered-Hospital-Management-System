import json
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.faq import HospitalFAQ
from app.models.schedule import DoctorSchedule
from app.services.schedule_service import get_doctor_available_slots, check_slot_available_or_raise
from app.services.audit_service import log_audit

# Google Gemini Tool Declarations (Native Python Callables)
def search_doctors(department: str = "", name: str = "") -> str:
    """Search for hospital doctors by medical department or doctor name or specialization."""
    return ""

def get_doctor_details(doctor_id: int) -> str:
    """Retrieve comprehensive details for a specific doctor including qualification, fee, and experience."""
    return ""

def get_available_slots(doctor_id: int, date: str) -> str:
    """Get real-time available appointment slots for a doctor on a specific date in YYYY-MM-DD format."""
    return ""

def book_appointment(doctor_id: int, slot_start: str, notes: str = "") -> str:
    """Book a confirmed hospital appointment for the authenticated patient with a doctor at a designated slot start time."""
    return ""

def get_my_appointments() -> str:
    """Retrieve all upcoming and past hospital appointments for the currently logged in patient."""
    return ""

def reschedule_appointment(appointment_id: int, new_slot: str) -> str:
    """Reschedule an existing confirmed appointment to a new available slot."""
    return ""

def cancel_appointment(appointment_id: int, reason: str = "") -> str:
    """Cancel an existing appointment for the authenticated patient."""
    return ""

def get_hospital_faq(question: str) -> str:
    """Retrieve general hospital operational information such as visiting hours, parking, insurance, billing, and facilities."""
    return ""

GEMINI_HOSPITAL_TOOLS = [
    search_doctors,
    get_doctor_details,
    get_available_slots,
    book_appointment,
    get_my_appointments,
    reschedule_appointment,
    cancel_appointment,
    get_hospital_faq
]

# Standard Tool Schema Definitions (JSON schema compatible)
HOSPITAL_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_doctors",
            "description": "Search for hospital doctors by medical department or doctor name or specialization.",
            "parameters": {
                "type": "object",
                "properties": {
                    "department": {
                        "type": "string",
                        "description": "Department or specialty name, e.g. Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, General Medicine"
                    },
                    "name": {
                        "type": "string",
                        "description": "Doctor's first or last name"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_doctor_details",
            "description": "Retrieve comprehensive details for a specific doctor including qualification, fee, and experience.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "integer",
                        "description": "The unique numerical ID of the doctor"
                    }
                },
                "required": ["doctor_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_available_slots",
            "description": "Get real-time available appointment slots for a doctor on a specific date (YYYY-MM-DD).",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "integer",
                        "description": "The unique numerical ID of the doctor"
                    },
                    "date": {
                        "type": "string",
                        "description": "Target date in YYYY-MM-DD format (e.g. '2026-11-02')"
                    }
                },
                "required": ["doctor_id", "date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book a confirmed hospital appointment for the authenticated patient with a doctor at a designated slot start time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "integer",
                        "description": "The unique ID of the doctor"
                    },
                    "slot_start": {
                        "type": "string",
                        "description": "ISO format slot start timestamp, e.g. '2026-11-02T10:00:00'"
                    },
                    "notes": {
                        "type": "string",
                        "description": "Optional patient notes or reason for visit"
                    }
                },
                "required": ["doctor_id", "slot_start"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_appointments",
            "description": "Retrieve all upcoming and past hospital appointments for the currently logged in patient.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reschedule_appointment",
            "description": "Reschedule an existing confirmed appointment to a new available slot.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {
                        "type": "integer",
                        "description": "The unique ID of the appointment to reschedule"
                    },
                    "new_slot": {
                        "type": "string",
                        "description": "The new ISO format start time, e.g. '2026-11-03T11:00:00'"
                    }
                },
                "required": ["appointment_id", "new_slot"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_appointment",
            "description": "Cancel an existing appointment for the authenticated patient.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {
                        "type": "integer",
                        "description": "The unique ID of the appointment to cancel"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Optional cancellation reason"
                    }
                },
                "required": ["appointment_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_hospital_faq",
            "description": "Retrieve general hospital operational information such as visiting hours, parking, insurance, billing, and facilities.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The topic or question to query in the hospital knowledge base"
                    }
                },
                "required": ["question"]
            }
        }
    }
]

# Tool Execution Backend Functions
def execute_backend_tool(
    tool_name: str,
    args: Dict[str, Any],
    db: Session,
    patient_id: Optional[int] = None,
    user_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Validates every tool call from the AI, enforces business rules & permissions,
    and returns verified data from PostgreSQL/SQLAlchemy.
    """
    if tool_name == "search_doctors":
        department_name = args.get("department")
        name = args.get("name")
        query = db.query(Doctor).filter(Doctor.is_active == True)
        
        if department_name:
            query = query.join(Department).filter(
                or_(
                    Department.name.ilike(f"%{department_name}%"),
                    Doctor.specialization.ilike(f"%{department_name}%")
                )
            )
        if name:
            query = query.filter(Doctor.name.ilike(f"%{name}%"))

        doctors = query.limit(8).all()
        doc_list = []
        for d in doctors:
            doc_list.append({
                "id": d.id,
                "name": d.name,
                "qualification": d.qualification,
                "specialization": d.specialization,
                "department": d.department.name if d.department else "General",
                "experience": f"{d.experience} years",
                "consultation_fee": f"${d.consultation_fee:.2f}",
                "profile_image": d.profile_image
            })
        return {
            "status": "success",
            "count": len(doc_list),
            "doctors": doc_list,
            "_ui_type": "doctors_list"
        }

    elif tool_name == "get_doctor_details":
        doc_id = args.get("doctor_id")
        doctor = db.query(Doctor).filter(Doctor.id == doc_id, Doctor.is_active == True).first()
        if not doctor:
            return {"status": "error", "message": f"Doctor #{doc_id} not found."}
        return {
            "status": "success",
            "doctor": {
                "id": doctor.id,
                "name": doctor.name,
                "qualification": doctor.qualification,
                "specialization": doctor.specialization,
                "department": doctor.department.name if doctor.department else "General",
                "experience": doctor.experience,
                "consultation_fee": doctor.consultation_fee,
                "bio": doctor.bio,
                "profile_image": doctor.profile_image
            },
            "_ui_type": "doctor_card"
        }

    elif tool_name == "get_available_slots":
        doc_id = args.get("doctor_id")
        date_str = args.get("date")
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception:
            return {"status": "error", "message": "Invalid date format. Please use YYYY-MM-DD."}

        doctor = db.query(Doctor).filter(Doctor.id == doc_id, Doctor.is_active == True).first()
        if not doctor:
            return {"status": "error", "message": f"Doctor #{doc_id} not found."}

        slots = get_doctor_available_slots(db=db, doctor_id=doc_id, target_date=target_date)
        formatted_slots = [
            {
                "slot_start": s.slot_start.isoformat(),
                "slot_end": s.slot_end.isoformat(),
                "time": s.formatted_time,
                "is_available": s.is_available
            }
            for s in slots
        ]
        available_only = [s for s in formatted_slots if s["is_available"]]
        return {
            "status": "success",
            "doctor_id": doc_id,
            "doctor_name": doctor.name,
            "specialization": doctor.specialization,
            "date": date_str,
            "total_slots": len(formatted_slots),
            "available_slots_count": len(available_only),
            "available_slots": available_only,
            "_ui_type": "slots_list"
        }

    elif tool_name == "book_appointment":
        if not patient_id:
            return {
                "status": "auth_required",
                "message": "You must be registered and logged in as a patient to book an appointment. Please log in or register."
            }

        doc_id = args.get("doctor_id")
        slot_str = args.get("slot_start")
        notes = args.get("notes", "Booked via Hospital Assistant AI")

        try:
            slot_start = datetime.fromisoformat(slot_str.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            return {"status": "error", "message": "Invalid slot format."}

        try:
            # Enforce validation
            check_slot_available_or_raise(db=db, doctor_id=doc_id, slot_start=slot_start)
        except Exception as e:
            return {"status": "error", "message": str(e.detail if hasattr(e, 'detail') else e)}

        doctor = db.query(Doctor).filter(Doctor.id == doc_id).first()
        duration = 30
        sched = db.query(DoctorSchedule).filter(
            DoctorSchedule.doctor_id == doc_id,
            DoctorSchedule.weekday == slot_start.weekday()
        ).first()
        if sched:
            duration = sched.slot_duration

        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doc_id,
            slot_start=slot_start,
            slot_end=slot_start + timedelta(minutes=duration),
            status=AppointmentStatus.CONFIRMED.value,
            notes=notes
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        log_audit(
            db,
            action="CHATBOT_BOOK_APPOINTMENT",
            entity="Appointment",
            actor_id=user_id,
            entity_id=appointment.id,
            details=f"Booked via AI Assistant with Dr. {doctor.name} on {slot_start}"
        )

        return {
            "status": "success",
            "message": f"Appointment successfully confirmed with Dr. {doctor.name} for {slot_start.strftime('%B %d, %Y at %I:%M %p')}.",
            "appointment": {
                "id": appointment.id,
                "doctor_name": doctor.name,
                "specialization": doctor.specialization,
                "consultation_fee": doctor.consultation_fee,
                "slot_start": appointment.slot_start.isoformat(),
                "status": appointment.status
            },
            "_ui_type": "booking_confirmation"
        }

    elif tool_name == "get_my_appointments":
        if not patient_id:
            return {
                "status": "auth_required",
                "message": "Please log in to view your appointments."
            }
        appointments = db.query(Appointment).filter(
            Appointment.patient_id == patient_id
        ).order_by(Appointment.slot_start.desc()).limit(10).all()

        results = []
        for app in appointments:
            results.append({
                "id": app.id,
                "doctor_name": app.doctor.name if app.doctor else "Unknown",
                "specialization": app.doctor.specialization if app.doctor else "",
                "slot_start": app.slot_start.strftime("%b %d, %Y - %I:%M %p"),
                "status": app.status,
                "notes": app.notes
            })
        return {
            "status": "success",
            "count": len(results),
            "appointments": results,
            "_ui_type": "my_appointments"
        }

    elif tool_name == "cancel_appointment":
        if not patient_id:
            return {"status": "auth_required", "message": "Please log in to cancel appointments."}

        app_id = args.get("appointment_id")
        reason = args.get("reason", "Cancelled via Hospital Assistant")
        appointment = db.query(Appointment).filter(
            Appointment.id == app_id,
            Appointment.patient_id == patient_id
        ).first()

        if not appointment:
            return {"status": "error", "message": f"Appointment #{app_id} not found under your patient profile."}
        if appointment.status == AppointmentStatus.CANCELLED.value:
            return {"status": "error", "message": "This appointment has already been cancelled."}

        appointment.status = AppointmentStatus.CANCELLED.value
        appointment.notes = (appointment.notes or "") + f" [Cancelled: {reason}]"
        db.commit()

        log_audit(
            db,
            action="CHATBOT_CANCEL_APPOINTMENT",
            entity="Appointment",
            actor_id=user_id,
            entity_id=appointment.id,
            details=f"Cancelled appointment #{appointment.id} via AI Assistant"
        )

        return {
            "status": "success",
            "message": f"Appointment #{app_id} with Dr. {appointment.doctor.name} has been cancelled successfully.",
            "_ui_type": "cancellation_notice"
        }

    elif tool_name == "reschedule_appointment":
        if not patient_id:
            return {"status": "auth_required", "message": "Please log in to reschedule appointments."}

        app_id = args.get("appointment_id")
        new_slot_str = args.get("new_slot")
        appointment = db.query(Appointment).filter(
            Appointment.id == app_id,
            Appointment.patient_id == patient_id
        ).first()

        if not appointment:
            return {"status": "error", "message": f"Appointment #{app_id} not found."}

        try:
            new_slot = datetime.fromisoformat(new_slot_str.replace("Z", "+00:00")).replace(tzinfo=None)
            check_slot_available_or_raise(
                db=db,
                doctor_id=appointment.doctor_id,
                slot_start=new_slot,
                exclude_appointment_id=appointment.id
            )
        except Exception as e:
            return {"status": "error", "message": str(e.detail if hasattr(e, 'detail') else e)}

        sched = db.query(DoctorSchedule).filter(
            DoctorSchedule.doctor_id == appointment.doctor_id,
            DoctorSchedule.weekday == new_slot.weekday()
        ).first()
        duration = sched.slot_duration if sched else 30

        appointment.slot_start = new_slot
        appointment.slot_end = new_slot + timedelta(minutes=duration)
        appointment.status = AppointmentStatus.CONFIRMED.value
        db.commit()

        return {
            "status": "success",
            "message": f"Appointment #{app_id} successfully rescheduled to {new_slot.strftime('%B %d, %Y at %I:%M %p')}.",
            "_ui_type": "reschedule_notice"
        }

    elif tool_name == "get_hospital_faq":
        question = args.get("question", "")
        # Search FAQs
        search_pattern = f"%{question}%"
        words = question.split()
        faqs = db.query(HospitalFAQ).filter(
            or_(
                HospitalFAQ.question.ilike(search_pattern),
                HospitalFAQ.answer.ilike(search_pattern),
                *[HospitalFAQ.question.ilike(f"%{w}%") for w in words if len(w) > 3]
            )
        ).limit(3).all()

        if not faqs:
            # Fallback to general hospital FAQ
            all_faqs = db.query(HospitalFAQ).limit(4).all()
            faq_data = [{"question": f.question, "answer": f.answer} for f in all_faqs]
            return {
                "status": "success",
                "message": "Here is some general information about our hospital:",
                "faqs": faq_data
            }

        return {
            "status": "success",
            "faqs": [{"question": f.question, "answer": f.answer} for f in faqs]
        }

    return {"status": "error", "message": f"Unknown tool: {tool_name}"}

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.schedule import DoctorSchedule
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.appointment import (
    AppointmentCreate, AppointmentReschedule, AppointmentCancel, AppointmentOut
)
from app.api.deps import get_current_user
from app.services.schedule_service import check_slot_available_or_raise
from app.services.audit_service import log_audit

router = APIRouter(prefix="/appointments", tags=["Appointments"])

def _format_appointment(app: Appointment) -> dict:
    return {
        "id": app.id,
        "patient_id": app.patient_id,
        "doctor_id": app.doctor_id,
        "slot_start": app.slot_start,
        "slot_end": app.slot_end,
        "status": app.status,
        "notes": app.notes,
        "created_at": app.created_at,
        "doctor": {
            "id": app.doctor.id,
            "name": app.doctor.name,
            "specialization": app.doctor.specialization,
            "qualification": app.doctor.qualification,
            "consultation_fee": app.doctor.consultation_fee,
            "profile_image": app.doctor.profile_image
        } if app.doctor else None,
        "patient": {
            "id": app.patient.id,
            "phone": app.patient.phone,
            "user_name": app.patient.user.name if app.patient and app.patient.user else None,
            "user_email": app.patient.user.email if app.patient and app.patient.user else None,
        } if app.patient else None,
    }

@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreate,
    patient_id: Optional[int] = Query(None, description="Optional override for receptionist/admin"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine the effective patient
    target_patient_id: Optional[int] = None

    if current_user.role == UserRole.PATIENT.value:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")
        target_patient_id = patient.id
    elif current_user.role in [UserRole.RECEPTIONIST.value, UserRole.ADMIN.value]:
        if not patient_id:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="patient_id is required when booking as staff")
        target_patient_id = patient_id
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role not permitted to book appointments")

    # Verify doctor exists and is active
    doctor = db.query(Doctor).filter(Doctor.id == payload.doctor_id, Doctor.is_active == True).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found or inactive")

    # Check slot availability & double booking
    check_slot_available_or_raise(db=db, doctor_id=payload.doctor_id, slot_start=payload.slot_start)

    # Determine slot duration from doctor schedule or default to 30 mins
    weekday = payload.slot_start.weekday()
    sched = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == payload.doctor_id,
        DoctorSchedule.weekday == weekday
    ).first()
    duration = sched.slot_duration if sched else 30
    slot_end = payload.slot_start + timedelta(minutes=duration)

    # Check if patient already has an active appointment at the exact same slot
    duplicate_patient_booking = db.query(Appointment).filter(
        Appointment.patient_id == target_patient_id,
        Appointment.slot_start == payload.slot_start,
        Appointment.status.in_([AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value])
    ).first()
    if duplicate_patient_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an appointment scheduled for this exact time"
        )

    # Create the appointment inside database transaction
    appointment = Appointment(
        patient_id=target_patient_id,
        doctor_id=payload.doctor_id,
        slot_start=payload.slot_start,
        slot_end=slot_end,
        status=AppointmentStatus.CONFIRMED.value,
        notes=payload.notes
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    log_audit(
        db,
        action="BOOK_APPOINTMENT",
        entity="Appointment",
        actor_id=current_user.id,
        entity_id=appointment.id,
        details=f"Booked appointment #{appointment.id} with Dr. {doctor.name} at {appointment.slot_start}"
    )

    return _format_appointment(appointment)

@router.get("/me", response_model=List[AppointmentOut])
def get_my_appointments(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)

    if current_user.role == UserRole.PATIENT.value:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            return []
        query = query.filter(Appointment.patient_id == patient.id)
    elif current_user.role == UserRole.DOCTOR.value:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            return []
        query = query.filter(Appointment.doctor_id == doctor.id)
    elif current_user.role in [UserRole.RECEPTIONIST.value, UserRole.ADMIN.value]:
        # Receptionist or admin gets list of all appointments
        pass
    else:
        return []

    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    appointments = query.order_by(Appointment.slot_start.desc()).all()
    return [_format_appointment(app) for app in appointments]

@router.patch("/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    appointment_id: int,
    payload: Optional[AppointmentCancel] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # Ownership check
    if current_user.role == UserRole.PATIENT.value:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only cancel your own appointments")
    elif current_user.role == UserRole.DOCTOR.value:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own appointments")
    elif current_user.role not in [UserRole.RECEPTIONIST.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if appointment.status == AppointmentStatus.CANCELLED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Appointment is already cancelled")

    appointment.status = AppointmentStatus.CANCELLED.value
    if payload and payload.reason:
        appointment.notes = (appointment.notes or "") + f" [Cancellation Reason: {payload.reason}]"

    db.commit()
    db.refresh(appointment)

    log_audit(
        db,
        action="CANCEL_APPOINTMENT",
        entity="Appointment",
        actor_id=current_user.id,
        entity_id=appointment.id,
        details=f"Appointment #{appointment.id} cancelled"
    )

    return _format_appointment(appointment)

@router.patch("/{appointment_id}/reschedule", response_model=AppointmentOut)
def reschedule_appointment(
    appointment_id: int,
    payload: AppointmentReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # Ownership check
    if current_user.role == UserRole.PATIENT.value:
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only reschedule your own appointments")
    elif current_user.role not in [UserRole.RECEPTIONIST.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Validate slot availability (exclude current appointment from collision)
    check_slot_available_or_raise(
        db=db,
        doctor_id=appointment.doctor_id,
        slot_start=payload.new_slot_start,
        exclude_appointment_id=appointment.id
    )

    weekday = payload.new_slot_start.weekday()
    sched = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == appointment.doctor_id,
        DoctorSchedule.weekday == weekday
    ).first()
    duration = sched.slot_duration if sched else 30

    old_slot = appointment.slot_start
    appointment.slot_start = payload.new_slot_start
    appointment.slot_end = payload.new_slot_start + timedelta(minutes=duration)
    appointment.status = AppointmentStatus.CONFIRMED.value

    db.commit()
    db.refresh(appointment)

    log_audit(
        db,
        action="RESCHEDULE_APPOINTMENT",
        entity="Appointment",
        actor_id=current_user.id,
        entity_id=appointment.id,
        details=f"Appointment #{appointment.id} rescheduled from {old_slot} to {appointment.slot_start}"
    )

    return _format_appointment(appointment)

@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    new_status: str = Query(..., pattern="^(pending|confirmed|cancelled|completed)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if current_user.role == UserRole.DOCTOR.value:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your assigned appointments")
    elif current_user.role not in [UserRole.RECEPTIONIST.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    appointment.status = new_status
    db.commit()
    db.refresh(appointment)

    log_audit(
        db,
        action="UPDATE_APPOINTMENT_STATUS",
        entity="Appointment",
        actor_id=current_user.id,
        entity_id=appointment.id,
        details=f"Appointment #{appointment.id} status changed to {new_status}"
    )

    return _format_appointment(appointment)

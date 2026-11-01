from datetime import datetime, date, time, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models.doctor import Doctor
from app.models.schedule import DoctorSchedule, ScheduleException
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.appointment import AvailableSlot

def get_doctor_available_slots(
    db: Session,
    doctor_id: int,
    target_date: date
) -> List[AvailableSlot]:
    """
    Computes all available slots for a doctor on a specific date.
    Considers weekly schedule, schedule exceptions, already booked appointments,
    and ensures past slots are not offered.
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found or inactive")

    # 1. Check if the doctor has an exception/leave on this date
    has_exception = db.query(ScheduleException).filter(
        ScheduleException.doctor_id == doctor_id,
        ScheduleException.date == target_date
    ).first()
    if has_exception:
        return []  # Doctor on leave or blocked

    # 2. Check weekly schedule for target_date.weekday() (0=Monday, 6=Sunday)
    weekday = target_date.weekday()
    schedules = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == doctor_id,
        DoctorSchedule.weekday == weekday
    ).all()

    if not schedules:
        return []  # Doctor does not work on this weekday

    # 3. Retrieve all non-cancelled appointments for this doctor on target_date
    start_of_day = datetime.combine(target_date, time.min)
    end_of_day = datetime.combine(target_date, time.max)

    booked_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.slot_start >= start_of_day,
        Appointment.slot_start <= end_of_day,
        Appointment.status.in_([AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value])
    ).all()

    booked_slot_starts = {app.slot_start for app in booked_appointments}

    # Current time (timezone naive or UTC comparison)
    now = datetime.now()

    available_slots: List[AvailableSlot] = []

    for schedule in schedules:
        current_time = datetime.combine(target_date, schedule.start_time)
        schedule_end = datetime.combine(target_date, schedule.end_time)
        duration = timedelta(minutes=schedule.slot_duration or 30)

        while current_time + duration <= schedule_end:
            slot_end = current_time + duration
            is_in_past = current_time <= now
            is_booked = current_time in booked_slot_starts

            is_available = (not is_in_past) and (not is_booked)

            available_slots.append(AvailableSlot(
                slot_start=current_time,
                slot_end=slot_end,
                formatted_time=f"{current_time.strftime('%I:%M %p')} - {slot_end.strftime('%I:%M %p')}",
                is_available=is_available
            ))

            current_time = slot_end

    # Sort slots chronologically
    available_slots.sort(key=lambda s: s.slot_start)
    return available_slots

def check_slot_available_or_raise(
    db: Session,
    doctor_id: int,
    slot_start: datetime,
    exclude_appointment_id: Optional[int] = None
) -> None:
    """
    Validates that a requested slot is strictly in the future and not already booked.
    Raises HTTPException with HTTP 409 CONFLICT if already booked,
    or HTTP 422 UNPROCESSABLE_ENTITY if in the past.
    """
    now = datetime.now()
    if slot_start <= now:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Appointments must be booked for a future date and time"
        )

    # Check for leave/exception
    has_exception = db.query(ScheduleException).filter(
        ScheduleException.doctor_id == doctor_id,
        ScheduleException.date == slot_start.date()
    ).first()
    if has_exception:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Doctor is unavailable on this date: {has_exception.reason or 'Leave'}"
        )

    # Check for colliding booked appointments
    query = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.slot_start == slot_start,
        Appointment.status.in_([AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value])
    )
    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)

    collision = query.first()
    if collision:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This appointment slot is already booked. Please choose another slot."
        )

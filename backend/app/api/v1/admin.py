from datetime import datetime, date, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.schedule import DoctorSchedule, ScheduleException
from app.models.appointment import Appointment, AppointmentStatus
from app.models.faq import HospitalFAQ
from app.models.audit import AuditLog
from app.schemas.admin import DashboardStats, AuditLogOut
from app.schemas.user import UserOut
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorOut, ScheduleCreate, ExceptionCreate
from app.schemas.department import DepartmentCreate, DepartmentOut
from app.schemas.faq import FAQCreate, FAQOut
from app.schemas.appointment import AppointmentOut
from app.api.deps import require_role
from app.core.security import get_password_hash
from app.services.audit_service import log_audit
from app.api.v1.appointments import _format_appointment

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

# Dependency ensuring caller is Admin (or Receptionist for select operations)
admin_only = require_role([UserRole.ADMIN.value])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()

    today_start = datetime.combine(date.today(), time.min)
    today_end = datetime.combine(date.today(), time.max)
    today_appointments = db.query(Appointment).filter(
        Appointment.slot_start >= today_start,
        Appointment.slot_start <= today_end
    ).count()

    pending_apps = db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING.value).count()
    confirmed_apps = db.query(Appointment).filter(Appointment.status == AppointmentStatus.CONFIRMED.value).count()
    cancelled_apps = db.query(Appointment).filter(Appointment.status == AppointmentStatus.CANCELLED.value).count()
    completed_apps = db.query(Appointment).filter(Appointment.status == AppointmentStatus.COMPLETED.value).count()

    departments = db.query(Department).all()
    dep_stats = []
    for dep in departments:
        count = db.query(Doctor).filter(Doctor.department_id == dep.id, Doctor.is_active == True).count()
        dep_stats.append({dep.name: count})

    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(15).all()
    recent_activity = [
        AuditLogOut(
            id=log.id,
            actor_id=log.actor_id,
            actor_name=log.actor.name if log.actor else "System",
            action=log.action,
            entity=log.entity,
            entity_id=log.entity_id,
            details=log.details,
            created_at=log.created_at
        )
        for log in recent_logs
    ]

    return DashboardStats(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        today_appointments=today_appointments,
        pending_appointments=pending_apps,
        confirmed_appointments=confirmed_apps,
        cancelled_appointments=cancelled_apps,
        completed_appointments=completed_apps,
        department_stats=dep_stats,
        recent_activity=recent_activity
    )

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()

@router.post("/doctors", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists")

    # 1. Create doctor User
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
        role=UserRole.DOCTOR.value
    )
    db.add(user)
    db.flush()

    # 2. Create Doctor profile
    doctor = Doctor(
        user_id=user.id,
        department_id=payload.department_id,
        name=payload.name,
        qualification=payload.qualification,
        specialization=payload.specialization,
        experience=payload.experience,
        consultation_fee=payload.consultation_fee,
        profile_image=payload.profile_image,
        bio=payload.bio,
        is_active=payload.is_active
    )
    db.add(doctor)
    db.flush()

    # 3. Create default schedules: Monday through Friday (0 to 4), 9 AM - 5 PM
    for day in range(5):
        sched = DoctorSchedule(
            doctor_id=doctor.id,
            weekday=day,
            start_time=time(9, 0),
            end_time=time(17, 0),
            slot_duration=30
        )
        db.add(sched)

    db.commit()
    db.refresh(doctor)

    log_audit(
        db,
        action="CREATE_DOCTOR",
        entity="Doctor",
        actor_id=current_user.id,
        entity_id=doctor.id,
        details=f"Created Dr. {doctor.name} ({doctor.specialization})"
    )

    return doctor

@router.put("/doctors/{doctor_id}", response_model=DoctorOut)
def update_doctor(
    doctor_id: int,
    payload: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(doctor, field, val)

    # Sync name with user model if changed
    if payload.name:
        doctor.user.name = payload.name

    db.commit()
    db.refresh(doctor)

    log_audit(
        db,
        action="UPDATE_DOCTOR",
        entity="Doctor",
        actor_id=current_user.id,
        entity_id=doctor.id,
        details=f"Updated details for Dr. {doctor.name}"
    )

    return doctor

@router.delete("/doctors/{doctor_id}")
def deactivate_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    doctor.is_active = False
    db.commit()

    log_audit(
        db,
        action="DEACTIVATE_DOCTOR",
        entity="Doctor",
        actor_id=current_user.id,
        entity_id=doctor.id,
        details=f"Deactivated Dr. {doctor.name}"
    )

    return {"message": f"Doctor {doctor.name} has been deactivated"}

@router.post("/departments", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    existing = db.query(Department).filter(Department.name.ilike(payload.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Department with this name already exists")

    dep = Department(
        name=payload.name,
        description=payload.description,
        icon=payload.icon,
        image_url=payload.image_url
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)

    log_audit(
        db,
        action="CREATE_DEPARTMENT",
        entity="Department",
        actor_id=current_user.id,
        entity_id=dep.id,
        details=f"Created department {dep.name}"
    )

    return DepartmentOut(
        id=dep.id,
        name=dep.name,
        description=dep.description,
        icon=dep.icon,
        image_url=dep.image_url,
        doctor_count=0
    )

@router.get("/appointments", response_model=List[AppointmentOut])
def list_all_appointments(
    doctor_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    query = db.query(Appointment)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    appointments = query.order_by(Appointment.slot_start.desc()).all()
    return [_format_appointment(app) for app in appointments]

@router.get("/audit-logs", response_model=List[AuditLogOut])
def list_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        AuditLogOut(
            id=log.id,
            actor_id=log.actor_id,
            actor_name=log.actor.name if log.actor else "System",
            action=log.action,
            entity=log.entity,
            entity_id=log.entity_id,
            details=log.details,
            created_at=log.created_at
        )
        for log in logs
    ]

@router.get("/faqs", response_model=List[FAQOut])
def list_faqs(db: Session = Depends(get_db)):
    faqs = db.query(HospitalFAQ).all()
    results = []
    for faq in faqs:
        results.append(FAQOut(
            id=faq.id,
            question=faq.question,
            answer=faq.answer,
            department_id=faq.department_id,
            department_name=faq.department.name if faq.department else None
        ))
    return results

@router.post("/faqs", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    faq = HospitalFAQ(
        question=payload.question,
        answer=payload.answer,
        department_id=payload.department_id
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)

    log_audit(
        db,
        action="CREATE_FAQ",
        entity="HospitalFAQ",
        actor_id=current_user.id,
        entity_id=faq.id,
        details=f"Created FAQ: {faq.question[:50]}..."
    )

    return FAQOut(
        id=faq.id,
        question=faq.question,
        answer=faq.answer,
        department_id=faq.department_id,
        department_name=faq.department.name if faq.department else None
    )

@router.delete("/faqs/{faq_id}")
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    faq = db.query(HospitalFAQ).filter(HospitalFAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    db.delete(faq)
    db.commit()
    return {"message": "FAQ deleted"}

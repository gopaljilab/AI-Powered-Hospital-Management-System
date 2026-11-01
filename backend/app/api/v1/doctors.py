from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.doctor import Doctor
from app.models.department import Department
from app.schemas.doctor import DoctorOut
from app.schemas.department import DepartmentOut
from app.schemas.appointment import AvailableSlot
from app.services.schedule_service import get_doctor_available_slots

router = APIRouter(tags=["Doctors & Departments"])

@router.get("/departments", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    results = []
    for dep in departments:
        doc_count = db.query(Doctor).filter(Doctor.department_id == dep.id, Doctor.is_active == True).count()
        results.append(DepartmentOut(
            id=dep.id,
            name=dep.name,
            description=dep.description,
            icon=dep.icon,
            image_url=dep.image_url,
            doctor_count=doc_count
        ))
    return results

@router.get("/departments/{department_id}", response_model=DepartmentOut)
def get_department(department_id: int, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.id == department_id).first()
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    doc_count = db.query(Doctor).filter(Doctor.department_id == dep.id, Doctor.is_active == True).count()
    return DepartmentOut(
        id=dep.id,
        name=dep.name,
        description=dep.description,
        icon=dep.icon,
        image_url=dep.image_url,
        doctor_count=doc_count
    )

@router.get("/doctors", response_model=List[DoctorOut])
def list_doctors(
    search: Optional[str] = Query(None, description="Search by doctor name or specialization"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    db: Session = Depends(get_db)
):
    query = db.query(Doctor).filter(Doctor.is_active == True)

    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Doctor.name.ilike(search_pattern),
                Doctor.specialization.ilike(search_pattern),
                Doctor.qualification.ilike(search_pattern)
            )
        )

    return query.all()

@router.get("/doctors/{doctor_id}", response_model=DoctorOut)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor

@router.get("/doctors/{doctor_id}/slots", response_model=List[AvailableSlot])
def get_doctor_slots(
    doctor_id: int,
    target_date: Optional[str] = Query(None, alias="date", description="Target date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    if not target_date:
        slot_date = date.today()
    else:
        try:
            slot_date = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid date format. Expected YYYY-MM-DD"
            )

    return get_doctor_available_slots(db=db, doctor_id=doctor_id, target_date=slot_date)

from datetime import datetime, date, time, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.schedule import DoctorSchedule, ScheduleException
from app.models.appointment import Appointment, AppointmentStatus
from app.models.faq import HospitalFAQ
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@hospitalx.org").first():
            print("Database already seeded. Skipping...")
            return

        print("Seeding initial hospital data...")

        # 1. Admin User
        admin_user = User(
            name="Hospital Administrator",
            email="admin@hospitalx.org",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.ADMIN.value
        )
        db.add(admin_user)

        # 2. Receptionist User
        receptionist_user = User(
            name="Sarah Jenkins (Front Desk)",
            email="receptionist@hospitalx.org",
            password_hash=get_password_hash("Recep@123"),
            role=UserRole.RECEPTIONIST.value
        )
        db.add(receptionist_user)

        # 3. Patient Demo User
        patient_user = User(
            name="John Doe",
            email="patient@hospitalx.org",
            password_hash=get_password_hash("Patient@123"),
            role=UserRole.PATIENT.value
        )
        db.add(patient_user)
        db.flush()

        patient_profile = Patient(
            user_id=patient_user.id,
            phone="+1 (555) 234-5678",
            date_of_birth=date(1992, 5, 14),
            gender="Male",
            blood_group="O+",
            emergency_contact="Jane Doe: +1 (555) 987-6543"
        )
        db.add(patient_profile)

        # 4. Departments
        departments_data = [
            {
                "name": "Cardiology",
                "description": "Comprehensive cardiac evaluations, advanced diagnostics, ECG, echocardiography, and preventive heart care.",
                "icon": "HeartPulse",
                "image_url": "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Dermatology",
                "description": "Specialized dermatological care for skin conditions, acne therapy, eczema, allergy diagnostics, and clinical dermatology.",
                "icon": "Sparkles",
                "image_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Pediatrics",
                "description": "Dedicated pediatric wellness check-ups, childhood vaccinations, growth monitoring, and adolescent care.",
                "icon": "Baby",
                "image_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Orthopedics",
                "description": "Bone, joint, spine, sports medicine, fracture rehabilitation, and arthritis management.",
                "icon": "Bone",
                "image_url": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Neurology",
                "description": "Expert diagnosis and ongoing management for migraines, neurological disorders, neuropathy, and brain health.",
                "icon": "Brain",
                "image_url": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "General Medicine",
                "description": "Primary healthcare, routine physical exams, chronic disease management, fever, infections, and preventative health.",
                "icon": "Stethoscope",
                "image_url": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80"
            }
        ]

        created_deps = {}
        for d in departments_data:
            dep = Department(
                name=d["name"],
                description=d["description"],
                icon=d["icon"],
                image_url=d["image_url"]
            )
            db.add(dep)
            db.flush()
            created_deps[dep.name] = dep

        # 5. Doctors
        doctors_data = [
            {
                "name": "Dr. Sarah Chen, MD",
                "email": "dr.sarah@hospitalx.org",
                "department": "Cardiology",
                "qualification": "MD - Cardiology (Johns Hopkins), FACC",
                "specialization": "Interventional Cardiology & Preventive Heart Health",
                "experience": 14,
                "fee": 120.0,
                "profile_image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
                "bio": "Dr. Sarah Chen has over 14 years of clinical experience in advanced non-invasive cardiology, preventive heart disease screening, and arterial health management."
            },
            {
                "name": "Dr. Marcus Vance, MD",
                "email": "dr.marcus@hospitalx.org",
                "department": "Dermatology",
                "qualification": "MD - Dermatology (Stanford Medicine), FAAD",
                "specialization": "Clinical Dermatology & Laser Therapy",
                "experience": 10,
                "fee": 95.0,
                "profile_image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                "bio": "Dr. Marcus Vance specializes in complex dermatological conditions, eczema, psoriasis treatment, allergy-related skin lesions, and aesthetic dermatology."
            },
            {
                "name": "Dr. Elena Rostova, MD",
                "email": "dr.elena@hospitalx.org",
                "department": "Pediatrics",
                "qualification": "MD - Pediatrics (Columbia University), FAAP",
                "specialization": "Pediatric Growth & Adolescent Health",
                "experience": 12,
                "fee": 85.0,
                "profile_image": "https://images.unsplash.com/photo-1594824813637-674b0c8b6b19?w=400&auto=format&fit=crop&q=80",
                "bio": "Dr. Elena Rostova is passionate about delivering compassionate, child-centric care, developmental milestone evaluations, and immunization management."
            },
            {
                "name": "Dr. Aravind Patel, MS",
                "email": "dr.aravind@hospitalx.org",
                "department": "Orthopedics",
                "qualification": "MS - Orthopedic Surgery, Fellowship Sports Medicine",
                "specialization": "Joint Replacement & Musculoskeletal Sports Medicine",
                "experience": 16,
                "fee": 110.0,
                "profile_image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
                "bio": "Dr. Aravind Patel is an orthopedic specialist focusing on minimally invasive arthroscopic surgeries, sports trauma rehabilitation, and spine alignment."
            },
            {
                "name": "Dr. Claire Sterling, MD",
                "email": "dr.claire@hospitalx.org",
                "department": "Neurology",
                "qualification": "MD - Neurology (Harvard Medical School)",
                "specialization": "Neurological Diagnostics & Headache Medicine",
                "experience": 11,
                "fee": 130.0,
                "profile_image": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&auto=format&fit=crop&q=80",
                "bio": "Dr. Claire Sterling provides neurological assessments, migraine therapies, peripheral neuropathy care, and cognitive function evaluations."
            },
            {
                "name": "Dr. Robert Hughes, MD",
                "email": "dr.robert@hospitalx.org",
                "department": "General Medicine",
                "qualification": "MD - Internal Medicine (Mayo Clinic)",
                "specialization": "Internal Medicine & Chronic Disease Management",
                "experience": 18,
                "fee": 75.0,
                "profile_image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
                "bio": "Dr. Robert Hughes is a senior physician dedicated to comprehensive adult primary care, hypertension management, diabetes control, and annual wellness examinations."
            }
        ]

        created_doctors = []
        for d in doctors_data:
            doc_user = User(
                name=d["name"],
                email=d["email"],
                password_hash=get_password_hash("Doctor@123"),
                role=UserRole.DOCTOR.value
            )
            db.add(doc_user)
            db.flush()

            doctor = Doctor(
                user_id=doc_user.id,
                department_id=created_deps[d["department"]].id,
                name=d["name"],
                qualification=d["qualification"],
                specialization=d["specialization"],
                experience=d["experience"],
                consultation_fee=d["fee"],
                profile_image=d["profile_image"],
                bio=d["bio"],
                is_active=True
            )
            db.add(doctor)
            db.flush()
            created_doctors.append(doctor)

            # Doctor Schedule: Monday to Friday (weekdays 0 to 4), 9:00 AM - 5:00 PM, 30 min duration
            for day in range(5):
                sched = DoctorSchedule(
                    doctor_id=doctor.id,
                    weekday=day,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    slot_duration=30
                )
                db.add(sched)

        # 6. Schedule Exception (Dr. Sarah on leave next Friday)
        next_friday = date.today() + timedelta((4 - date.today().weekday()) % 7 + 7)
        exc = ScheduleException(
            doctor_id=created_doctors[0].id,
            date=next_friday,
            reason="Cardiology Annual Medical Conference"
        )
        db.add(exc)

        # 7. Sample Initial Appointment for Demo Patient
        # Tomorrow at 10:00 AM with Dr. Sarah Chen
        tomorrow = date.today() + timedelta(days=1)
        # If tomorrow is Saturday (5) or Sunday (6), move to Monday
        if tomorrow.weekday() == 5:
            tomorrow += timedelta(days=2)
        elif tomorrow.weekday() == 6:
            tomorrow += timedelta(days=1)

        sample_slot = datetime.combine(tomorrow, time(10, 0))
        sample_app = Appointment(
            patient_id=patient_profile.id,
            doctor_id=created_doctors[0].id,
            slot_start=sample_slot,
            slot_end=sample_slot + timedelta(minutes=30),
            status=AppointmentStatus.CONFIRMED.value,
            notes="Routine annual cardiac rhythm evaluation"
        )
        db.add(sample_app)

        # 8. Hospital FAQs
        faqs_data = [
            {
                "question": "What are the general hospital visiting hours?",
                "answer": "Visiting hours are Monday through Sunday from 8:00 AM to 8:00 PM. Intensive Care Units (ICU) have specialized visiting hours from 10:00 AM to 12:00 PM and 5:00 PM to 7:00 PM.",
                "department": None
            },
            {
                "question": "How do I book, reschedule, or cancel an appointment?",
                "answer": "You can book, reschedule, or cancel appointments directly through our AI Hospital Assistant in natural language, or by browsing the Doctors Directory and selecting an available time slot.",
                "department": None
            },
            {
                "question": "Do you accept major health insurance plans?",
                "answer": "Yes, HospitalX accepts major private health insurances including BlueCross BlueShield, Aetna, Cigna, UnitedHealthcare, Medicare, and Medicaid. Please bring your insurance card during your visit.",
                "department": None
            },
            {
                "question": "Where is the emergency department located?",
                "answer": "The Emergency Department is open 24/7/365 and is located on the ground floor with dedicated ambulance and drive-in access at 100 Hospital Way (Gate 1). For critical life emergencies, please call 911 immediately.",
                "department": None
            },
            {
                "question": "Is parking available for patients and visitors?",
                "answer": "Yes, complimentary visitor parking is located in the East Parking Garage (P1 and P2). Valet parking is available at the main hospital entrance from 7:00 AM to 6:00 PM.",
                "department": None
            },
            {
                "question": "What should I bring to my first appointment?",
                "answer": "Please bring a government-issued photo ID, your health insurance card, a list of current medications and supplements, and any prior medical diagnostic reports or scans.",
                "department": None
            },
            {
                "question": "How can I access diagnostic lab results?",
                "answer": "Diagnostic lab results and radiology scans are uploaded to your Patient Portal dashboard within 24 to 48 hours following your consultation and testing.",
                "department": None
            }
        ]

        for f in faqs_data:
            faq = HospitalFAQ(
                question=f["question"],
                answer=f["answer"]
            )
            db.add(faq)

        db.commit()
        print("Database successfully seeded with realistic healthcare data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

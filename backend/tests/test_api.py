import pytest
from datetime import datetime, date, time, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.database.seed import seed_database
from app.models.user import User
from app.models.doctor import Doctor
from app.models.appointment import Appointment, AppointmentStatus

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    seed_database()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_and_rbac():
    # 1. Register a new patient
    reg_email = f"testpatient_{datetime.now().timestamp()}@example.com"
    reg_payload = {
        "name": "Alice Wonderland",
        "email": reg_email,
        "password": "Password123!",
        "phone": "+1 555-0199",
        "gender": "Female",
        "blood_group": "A+"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    data_reg = res_reg.json()
    assert "access_token" in data_reg
    assert data_reg["user"]["role"] == "patient"
    patient_token = data_reg["access_token"]

    # 2. Duplicate registration should return 409 Conflict
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 409

    # 3. Login
    res_login = client.post("/api/v1/auth/login", json={"email": reg_email, "password": "Password123!"})
    assert res_login.status_code == 200
    assert res_login.json()["user"]["email"] == reg_email

    # 4. Auth Me
    headers = {"Authorization": f"Bearer {patient_token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Alice Wonderland"

    # 5. Patient cannot access admin dashboard (RBAC 403)
    res_admin_forbidden = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res_admin_forbidden.status_code == 403

def test_doctors_and_slot_calculation():
    # 1. List departments
    res_deps = client.get("/api/v1/departments")
    assert res_deps.status_code == 200
    deps = res_deps.json()
    assert len(deps) >= 1

    # 2. List doctors
    res_docs = client.get("/api/v1/doctors")
    assert res_docs.status_code == 200
    docs = res_docs.json()
    assert len(docs) >= 1
    first_doc_id = docs[0]["id"]

    # 3. Calculate slots for a weekday next week
    target_date = date.today() + timedelta(days=7)
    if target_date.weekday() >= 5: # weekend
        target_date += timedelta(days=(7 - target_date.weekday())) # Monday

    res_slots = client.get(f"/api/v1/doctors/{first_doc_id}/slots?date={target_date.isoformat()}")
    assert res_slots.status_code == 200
    slots = res_slots.json()
    assert isinstance(slots, list)

def test_appointment_lifecycle_and_double_booking():
    # Login as demo patient
    res_login = client.post("/api/v1/auth/login", json={"email": "patient@hospitalx.org", "password": "Patient@123"})
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Find first doctor
    docs = client.get("/api/v1/doctors").json()
    doctor_id = docs[0]["id"]

    # Pick a future weekday
    booking_date = date.today() + timedelta(days=14)
    if booking_date.weekday() >= 5:
        booking_date += timedelta(days=2)

    slot_time = datetime.combine(booking_date, time(14, 0))
    slot_iso = slot_time.isoformat()

    # Book slot
    booking_payload = {
        "doctor_id": doctor_id,
        "slot_start": slot_iso,
        "notes": "Automated workflow test consultation"
    }
    res_book = client.post("/api/v1/appointments", json=booking_payload, headers=headers)
    assert res_book.status_code == 201
    app_data = res_book.json()
    app_id = app_data["id"]
    assert app_data["status"] == "confirmed"

    # Test Double Booking: attempt to book the exact same slot again should return 409 Conflict
    res_double = client.post("/api/v1/appointments", json=booking_payload, headers=headers)
    assert res_double.status_code == 409

    # Reschedule to 15:00
    new_slot = datetime.combine(booking_date, time(15, 0)).isoformat()
    res_resched = client.patch(f"/api/v1/appointments/{app_id}/reschedule", json={"new_slot_start": new_slot}, headers=headers)
    assert res_resched.status_code == 200
    assert res_resched.json()["slot_start"].startswith(new_slot[:13])

    # Cancel appointment
    res_cancel = client.patch(f"/api/v1/appointments/{app_id}/cancel", json={"reason": "Testing complete"}, headers=headers)
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "cancelled"

def test_chatbot_safety_and_tools():
    # 1. Emergency safety interceptor
    res_emg = client.post("/api/v1/chat/messages", json={"message": "I am having severe chest pain and can't breathe!"})
    assert res_emg.status_code == 200
    data_emg = res_emg.json()
    assert "EMERGENCY" in data_emg["reply"]
    assert data_emg["tool_call_data"]["type"] == "emergency_alert"

    # 2. Medical advice refusal guardrail
    res_adv = client.post("/api/v1/chat/messages", json={"message": "What medicine should I take to cure my fever?"})
    assert res_adv.status_code == 200
    assert "administrative" in res_adv.json()["reply"].lower()

    # 3. Doctor inquiry via Chatbot
    res_doc = client.post("/api/v1/chat/messages", json={"message": "Can you recommend a cardiologist?"})
    assert res_doc.status_code == 200
    data_doc = res_doc.json()
    assert data_doc["tool_call_data"] is not None
    assert data_doc["tool_call_data"]["type"] in ["doctors_list", "slots_list"]

def test_admin_dashboard_metrics():
    # Login as Admin
    res_admin = client.post("/api/v1/auth/login", json={"email": "admin@hospitalx.org", "password": "Admin@123"})
    assert res_admin.status_code == 200
    admin_token = res_admin.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch dashboard metrics
    res_metrics = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res_metrics.status_code == 200
    metrics = res_metrics.json()
    assert metrics["total_doctors"] >= 6
    assert metrics["total_patients"] >= 1
    assert "department_stats" in metrics
    assert "recent_activity" in metrics

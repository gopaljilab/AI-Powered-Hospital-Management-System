# 🏥 AI-Powered Hospital Management System (HospitalX)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![Supabase PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, full-stack healthcare web application engineered with **FastAPI**, **React 18 + TypeScript**, **Supabase PostgreSQL**, and an **Intelligent Conversational Assistant** powered by **Google Gemini AI** (`google-genai` SDK) with robust backend tool calling and strict clinical safety guardrails.

---

## 🌟 Key Features

### 1. 🤖 Intelligent Conversational AI Assistant
- **Natural Language Booking**: Inquire about doctors, check live availability, and book appointments conversationally.
- **Backend Function Calling**: Gemini executes 8 verified backend tools with full parameter validation:
  - `search_doctors(department, name)`
  - `get_doctor_details(doctor_id)`
  - `get_available_slots(doctor_id, date)`
  - `book_appointment(doctor_id, slot_start)`
  - `get_my_appointments()`
  - `reschedule_appointment(appointment_id, new_slot)`
  - `cancel_appointment(appointment_id)`
  - `get_hospital_faq(question)`
- **Rich Interactive UI Widgets**: Embedded doctor profile cards carousel, selectable appointment slot chips, and modal confirmation dialogs directly inside message bubbles.
- **Zero-Failure Fallback Engine**: If a Gemini API key is not configured, the assistant automatically falls back to an intelligent, rule-based clinical engine with zero downtime or broken flows.
- **Clinical Safety Guardrails**:
  - *Emergency Interceptor*: Immediately halts booking for life-threatening symptoms (chest pain, stroke, severe bleeding) and directs to 911 / Emergency Room.
  - *No-Diagnosis Refusal*: Strictly refuses to interpret symptoms or prescribe medications, recommending certified specialist consultations instead.

### 2. 👥 4 Role-Based Access Control (RBAC) Portals
- **Patient Portal**: Search specialists, book/reschedule/cancel appointments, view medical appointment history, and chat with AI.
- **Doctor Portal**: View today's agenda and weekly schedule, manage slot duration, manage leave exceptions/blocked times, and update appointment statuses (`confirmed`, `completed`, `cancelled`).
- **Receptionist Portal**: Real-time hospital-wide appointment queue, register walk-in patients, manual booking/rescheduling override, and doctor status directory.
- **Administrator Portal**: Real-time hospital analytics dashboard, manage doctor staff and specialties, manage hospital departments and FAQs, and inspect comprehensive audit logs.

### 3. 🛡️ Architectural Reliability
- **Single Source of Truth**: The AI assistant never executes direct SQL or alters state arbitrarily; the backend API verifies permissions, validates slots, and commits ACID transactions.
- **Double-Booking Prevention**: Database-level verification prevents overlapping appointment slots down to the minute.
- **Database Agnostic**: Native support for **Supabase Managed PostgreSQL** (with transaction/session pooling and SSL) with automatic fallback to local SQLite for zero-config offline development.

---

## 🏗️ Architecture

```
                     ┌───────────────────────────┐
                     │   React + TypeScript UI   │
                     │  (Vite + Tailwind CSS)    │
                     └─────────────┬─────────────┘
                                   │ HTTP / JSON (REST)
                                   ▼
                     ┌───────────────────────────┐
                     │     FastAPI Backend       │
                     │  JWT Auth & RBAC Security │
                     └──────┬─────────────┬──────┘
                            │             │
        Tool Execution /    │             │ Gemini 1.5 Flash
        ACID Operations     │             │ Function Calling
                            ▼             ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │  Supabase PostgreSQL   │      │    Google Gemini AI    │
       │ (SQLAlchemy ORM + Pool)│      │  (`google-genai` SDK)  │
       └────────────────────────┘      └────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router v6 |
| **Backend** | Python 3.9+, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic |
| **AI Integration** | Google Gemini 1.5 Flash via official `google-genai` Python SDK |
| **Database** | Supabase Managed PostgreSQL (psycopg2) / SQLite dev fallback |
| **Authentication** | JWT (JSON Web Tokens), password hashing via bcrypt |
| **Testing** | Pytest, HTTPX TestClient |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- (Optional) **Supabase Account** ([supabase.com](https://supabase.com))
- (Optional) **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com/app/apikey))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/gopaljilab/AI-Powered-Hospital-Management-System.git
cd AI-Powered-Hospital-Management-System
```

---

### Step 2: Backend Setup

1. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure:
   ```ini
   # 1. Supabase PostgreSQL (or leave commented to use local SQLite)
   DATABASE_URL=postgresql+psycopg2://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require

   # 2. Google Gemini API Key (optional - built-in assistant works out of the box without key)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

4. **Initialize and Seed the Database:**
   ```bash
   export PYTHONPATH=backend
   python backend/app/database/seed.py
   ```

5. **Start the FastAPI Server:**
   ```bash
   export PYTHONPATH=backend
   uvicorn app.main:app --reload --port 8000
   ```
   Backend will be running at `http://localhost:8000`. Interactive Swagger API docs are accessible at `http://localhost:8000/docs`.

---

### Step 3: Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend will be live at `http://localhost:5173`.

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-seeded with sample medical departments, doctors, schedules, appointments, and test accounts for each role:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Patient** | `john@example.com` | `password123` | Patient Portal, AI Booking Assistant, Personal Bookings |
| **Doctor** | `doctor@hospitalx.com` | `password123` | Doctor Dashboard, Daily Appointments, Schedule & Leave |
| **Receptionist** | `receptionist@hospitalx.com` | `password123` | Hospital Queue, Walk-in Registration, Booking Desk |
| **Administrator** | `admin@hospitalx.com` | `password123` | Analytics, Staff Management, FAQs, Audit Logs |

---

## ⚡ Connecting to Supabase PostgreSQL

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** -> **Database** -> **Connection string** -> **URI**.
3. Select **Transaction Pooler** (Port `6543`) or **Session Pooler** (Port `5432`).
4. Paste the connection string into your `.env` file as `DATABASE_URL`:
   ```ini
   DATABASE_URL=postgresql+psycopg2://postgres.yourprojectref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. Run the seed script:
   ```bash
   export PYTHONPATH=backend
   python backend/app/database/seed.py
   ```
6. All 6 medical departments, doctors, schedules, FAQs, and demo accounts will be created directly in your Supabase database!

---

## 🤖 Configuring Google Gemini AI

1. Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add your key to `.env`:
   ```ini
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Restart the backend server. The chatbot will now run via Google Gemini 1.5 Flash with native tool calling!

> **Note:** If no key is set, the system seamlessly uses the built-in intelligent rule-based hospital assistant so all appointment discovery, doctor lookups, and booking flows work reliably without external API dependencies.

---

## 🧪 Automated Testing

Run the full backend test suite covering RBAC, slot calculations, double-booking prevention, chatbot safety guardrails, and admin metrics:

```bash
export PYTHONPATH=backend
pytest backend/tests/test_api.py -v
```

All 6 test suites pass with zero warnings:
```
backend/tests/test_api.py::test_health_check PASSED                      [ 16%]
backend/tests/test_api.py::test_auth_and_rbac PASSED                     [ 33%]
backend/tests/test_api.py::test_doctors_and_slot_calculation PASSED      [ 50%]
backend/tests/test_api.py::test_appointment_lifecycle_and_double_booking PASSED [ 66%]
backend/tests/test_api.py::test_chatbot_safety_and_tools PASSED          [ 83%]
backend/tests/test_api.py::test_admin_dashboard_metrics PASSED           [100%]
```

To run the frontend production build test:
```bash
cd frontend && npm run build
```

---

## 📂 Project Structure

```
.
├── backend/
│   ├── alembic/              # Database migration environments
│   ├── app/
│   │   ├── ai/               # Gemini AI assistant & backend tools
│   │   │   ├── chatbot.py    # Gemini conversation & safety guardrails
│   │   │   └── tools.py      # Hospital backend callable tools
│   │   ├── api/v1/           # Modular REST API endpoints
│   │   │   ├── admin.py      # Admin stats, staff & audit log APIs
│   │   │   ├── appointments.py # Booking, cancel, reschedule & slots
│   │   │   ├── auth.py       # Login, register & user profile
│   │   │   ├── chat.py       # AI chat message endpoint
│   │   │   ├── departments.py # Department directory
│   │   │   └── doctors.py    # Doctor directory & schedule management
│   │   ├── core/             # Configuration & JWT security
│   │   ├── database/         # SQLAlchemy session & seed data
│   │   ├── models/           # Declarative ORM models
│   │   └── schemas/          # Pydantic v2 validation models
│   ├── tests/
│   │   └── test_api.py       # Pytest automated test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI & ChatInterface
│   │   ├── context/          # React AuthContext
│   │   ├── pages/
│   │   │   ├── dashboards/   # Patient, Doctor, Receptionist, Admin
│   │   │   └── public/       # Home, Doctors, Assistant, Contact, etc.
│   │   ├── services/         # Axios API clients
│   │   └── types/            # TypeScript data definitions
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
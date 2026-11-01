import os
import json
import re
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.chat import Conversation, Message
from app.models.user import User
from app.models.patient import Patient
from app.ai.tools import GEMINI_HOSPITAL_TOOLS, HOSPITAL_TOOLS, execute_backend_tool

# Emergency keyword patterns
EMERGENCY_KEYWORDS = [
    r"\bchest pain\b", r"\bheart attack\b", r"\bcan'?t breathe\b", r"\bshortness of breath\b",
    r"\bstroke\b", r"\bsevere bleeding\b", r"\bbleeding heavily\b", r"\bunconscious\b",
    r"\bseizure\b", r"\bpoisoning\b", r"\boverdose\b", r"\bsuicide\b", r"\banaphylaxis\b"
]

MEDICAL_ADVICE_KEYWORDS = [
    r"\bdiagnose\b", r"\bwhat medicine\b", r"\bprescribe\b", r"\btreat my\b",
    r"\bcure my\b", r"\bantibiotics\b", r"\bwhat pills\b", r"\bshould i take\b"
]

SYSTEM_PROMPT = """You are 'Hospital Assistant', an intelligent, polite, and professional administrative hospital assistant for our modern hospital platform.

IMPORTANT SAFETY & COMPLIANCE RULES:
1. You are strictly an administrative booking and hospital info assistant. You are NOT a doctor or medical professional.
2. NEVER diagnose illnesses, recommend medications, suggest medical treatments, or interpret symptoms.
3. If a user asks for medical diagnosis or prescriptions, politely inform them that you cannot provide medical advice and offer to schedule an appointment with an appropriate medical specialist.
4. For medical emergencies (severe chest pain, breathing difficulties, trauma), stop the booking flow immediately and direct them to emergency services (call 911 / emergency room).
5. Never invent doctors, appointment slots, or fees. Always use the provided tools to query real hospital data.
6. Only confirm an appointment after the 'book_appointment' tool succeeds with database verification.
7. Always maintain patient confidentiality.
"""

def check_emergency(user_message: str) -> bool:
    lowered = user_message.lower()
    for pattern in EMERGENCY_KEYWORDS:
        if re.search(pattern, lowered):
            return True
    return False

def check_medical_advice(user_message: str) -> bool:
    lowered = user_message.lower()
    for pattern in MEDICAL_ADVICE_KEYWORDS:
        if re.search(pattern, lowered):
            return True
    return False

def fallback_rule_based_response(
    message: str,
    db: Session,
    patient_id: Optional[int] = None,
    user_id: Optional[int] = None
) -> Tuple[str, Optional[Dict[str, Any]], List[str]]:
    """
    Intelligent rule-based fallback assistant that ensures full functionality
    even when Gemini API key is not configured or external service is unreachable.
    """
    lowered = message.lower()

    # 1. Emergency safety check
    if check_emergency(lowered):
        return (
            "🚨 **MEDICAL EMERGENCY DETECTED**: If you or someone with you is experiencing life-threatening symptoms (such as acute chest pain, severe shortness of breath, heavy uncontrolled bleeding, or sudden numbness), please immediately call Emergency Services (911 / 112) or go to the nearest hospital Emergency Room. As an administrative assistant, I cannot provide urgent medical care.",
            {"type": "emergency_alert"},
            ["Find an Emergency Doctor", "Hospital Contact Info", "Department Directory"]
        )

    # 2. Medical advice check
    if check_medical_advice(lowered):
        return (
            "I am an administrative hospital assistant and cannot offer clinical diagnoses, interpret symptoms, or prescribe medication. To receive expert medical care, I can help you book an in-person or specialist consultation with one of our certified doctors.",
            None,
            ["Find a Doctor", "Available Departments", "Book an Appointment"]
        )

    # 3. View my appointments
    if any(k in lowered for k in ["my appointment", "my booking", "check my", "existing appointment", "view appointment"]):
        tool_res = execute_backend_tool("get_my_appointments", {}, db, patient_id=patient_id, user_id=user_id)
        if tool_res.get("status") == "auth_required":
            return (
                "To view your personal appointments, please log in with your patient account.",
                None,
                ["Login to Patient Account", "Find a Doctor", "Hospital FAQs"]
            )
        count = tool_res.get("count", 0)
        reply = f"You have {count} appointment(s) registered in our system."
        return (
            reply,
            {"type": "my_appointments", "data": tool_res.get("appointments", [])},
            ["Book New Appointment", "Find a Doctor", "Hospital Visiting Hours"]
        )

    # 4. Slots or dates inquiry
    if any(k in lowered for k in ["slot", "available", "schedule", "tomorrow", "time"]):
        dep_match = None
        for dep in ["cardiology", "dermatology", "pediatrics", "orthopedics", "neurology", "general"]:
            if dep in lowered:
                dep_match = dep
                break

        target_date = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
        if "today" in lowered:
            target_date = date.today().strftime("%Y-%m-%d")

        doc_res = execute_backend_tool("search_doctors", {"department": dep_match or "general"}, db)
        doctors = doc_res.get("doctors", [])
        if doctors:
            selected_doc = doctors[0]
            slot_res = execute_backend_tool("get_available_slots", {"doctor_id": selected_doc["id"], "date": target_date}, db)
            available = slot_res.get("available_slots", [])
            doc_name = selected_doc['name'] if selected_doc['name'].startswith("Dr.") else f"Dr. {selected_doc['name']}"
            reply = f"Here are the available appointment slots for **{doc_name}** ({selected_doc['specialization']}) on **{target_date}**:"
            return (
                reply,
                {
                    "type": "slots_list",
                    "doctor": selected_doc,
                    "date": target_date,
                    "slots": available
                },
                ["Book Morning Slot", "Select Another Doctor", "Check Another Date"]
            )

    # 5. Find / Search Doctors
    if any(k in lowered for k in ["doctor", "dermatologist", "cardiologist", "pediatrician", "orthopedic", "neurologist", "surgeon", "physician", "find", "search"]):
        dept = None
        for d in ["cardiology", "dermatology", "pediatrics", "orthopedics", "neurology", "general medicine", "oncology"]:
            if d.split()[0] in lowered:
                dept = d
                break

        tool_res = execute_backend_tool("search_doctors", {"department": dept}, db)
        docs = tool_res.get("doctors", [])
        if docs:
            reply = f"I found {len(docs)} qualified doctor(s) matching your inquiry. You can review their profiles and check available slots below:"
            return (
                reply,
                {"type": "doctors_list", "doctors": docs},
                ["Check Available Slots", "Book with Dr. " + docs[0]["name"].split()[-1], "Hospital Visiting Hours"]
            )

    # 6. FAQ inquiry (hours, parking, insurance, fees, contact)
    if any(k in lowered for k in ["hour", "visit", "time", "parking", "insurance", "fee", "cost", "contact", "address", "location"]):
        faq_res = execute_backend_tool("get_hospital_faq", {"question": message}, db)
        faqs = faq_res.get("faqs", [])
        if faqs:
            reply = f"Here is the relevant hospital information:\n\n**Q: {faqs[0]['question']}**\n{faqs[0]['answer']}"
            return (
                reply,
                {"type": "faq_item", "faqs": faqs},
                ["Find a Doctor", "Book an Appointment", "Contact Hospital Staff"]
            )

    # General greeting and capabilities
    return (
        "Hello! I am your **Hospital Assistant**. I can help you explore departments, find specialist doctors, check real-time appointment slots, book or reschedule appointments, and answer questions about visiting hours, insurance, and facilities.\n\nHow may I assist you today?",
        None,
        ["Find a Doctor", "Book an Appointment", "Check My Appointments", "Hospital Visiting Hours", "Emergency Information"]
    )

def process_chat_message(
    user_message: str,
    db: Session,
    conversation_id: Optional[int] = None,
    current_user: Optional[User] = None
) -> Dict[str, Any]:
    """
    Main conversational pipeline:
    1. Manages or creates conversation session.
    2. Enforces safety & emergency rules.
    3. Leverages Google Gemini API (gemini-1.5-flash / gemini-2.0-flash) with tool calling.
    4. Falls back seamlessly to rule-based assistant if key is missing or offline.
    5. Persists conversation and message history.
    """
    # Identify patient ID if user is authenticated
    patient_id = None
    user_id = current_user.id if current_user else None
    if current_user and current_user.patient_profile:
        patient_id = current_user.patient_profile.id

    # Find or create conversation
    if conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            conversation = Conversation(patient_id=patient_id)
            db.add(conversation)
            db.flush()
    else:
        conversation = Conversation(patient_id=patient_id)
        db.add(conversation)
        db.flush()

    # Save user message
    user_msg_db = Message(
        conversation_id=conversation.id,
        role="user",
        content=user_message
    )
    db.add(user_msg_db)
    db.flush()

    # Safety check for immediate emergency
    if check_emergency(user_message):
        reply, ui_payload, suggested = fallback_rule_based_response(user_message, db, patient_id, user_id)
        assistant_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=reply,
            tool_call_data=ui_payload
        )
        db.add(assistant_msg)
        db.commit()
        return {
            "conversation_id": conversation.id,
            "reply": reply,
            "tool_call_data": ui_payload,
            "suggested_prompts": suggested
        }

    # Attempt Google Gemini API if key exists
    gemini_key = (
        os.getenv("GEMINI_API_KEY") or
        os.getenv("GOOGLE_API_KEY") or
        settings.GEMINI_API_KEY or
        settings.GOOGLE_API_KEY
    )

    if gemini_key and gemini_key != "your_gemini_api_key_here" and len(gemini_key) > 8:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)

            # Build message history for Gemini
            past_messages = db.query(Message).filter(
                Message.conversation_id == conversation.id
            ).order_by(Message.created_at.asc()).limit(6).all()

            contents = []
            for msg in past_messages:
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg.content)]
                    )
                )

            # Configure tool calling
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=GEMINI_HOSPITAL_TOOLS,
                temperature=0.2,
            )

            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=contents,
                config=config
            )

            ui_attachment = None
            final_text = ""

            if response.function_calls:
                tool_results_parts = []
                for fc in response.function_calls:
                    fn_name = fc.name
                    fn_args = dict(fc.args) if fc.args else {}

                    tool_result = execute_backend_tool(
                        tool_name=fn_name,
                        args=fn_args,
                        db=db,
                        patient_id=patient_id,
                        user_id=user_id
                    )

                    if "_ui_type" in tool_result:
                        ui_type = tool_result.pop("_ui_type")
                        ui_attachment = {"type": ui_type, "data": tool_result}

                    tool_results_parts.append(
                        types.Part.from_function_response(
                            name=fn_name,
                            response={"result": json.dumps(tool_result)}
                        )
                    )

                # Send function response back to Gemini for conversational synthesis
                if response.candidates and response.candidates[0].content:
                    contents.append(response.candidates[0].content)
                contents.append(types.Content(role="tool", parts=tool_results_parts))

                second_response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=contents,
                    config=config
                )
                final_text = second_response.text or "I have retrieved the verified information from our hospital database."
            else:
                final_text = response.text or "How may I assist you today?"

            # Save assistant message
            assistant_msg = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=final_text,
                tool_call_data=ui_attachment
            )
            db.add(assistant_msg)
            db.commit()

            return {
                "conversation_id": conversation.id,
                "reply": final_text,
                "tool_call_data": ui_attachment,
                "suggested_prompts": ["Find a Doctor", "Available Slots", "Check My Bookings", "Visiting Hours"]
            }

        except Exception as e:
            print(f"[Gemini AI Fallback] Gemini API notice: {e}")

    # Fallback to intelligent rule-based engine
    reply, ui_payload, suggested = fallback_rule_based_response(user_message, db, patient_id, user_id)
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=reply,
        tool_call_data=ui_payload
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "conversation_id": conversation.id,
        "reply": reply,
        "tool_call_data": ui_payload,
        "suggested_prompts": suggested
    }

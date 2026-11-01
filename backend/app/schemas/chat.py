from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    conversation_id: int
    reply: str
    tool_call_data: Optional[Dict[str, Any]] = None  # e.g. doctors list, slot picker, confirmation card
    suggested_prompts: Optional[List[str]] = None

class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    tool_call_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationOut(BaseModel):
    id: int
    patient_id: Optional[int] = None
    started_at: datetime
    messages: List[MessageOut] = []

    model_config = ConfigDict(from_attributes=True)

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.chat import Conversation, Message
from app.schemas.chat import (
    ChatMessageRequest, ChatMessageResponse, ConversationOut, MessageOut
)
from app.api.deps import get_optional_current_user, get_current_user
from app.ai.chatbot import process_chat_message

router = APIRouter(prefix="/chat", tags=["AI Hospital Chatbot"])

@router.post("/messages", response_model=ChatMessageResponse)
def send_chat_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message cannot be empty")

    response = process_chat_message(
        user_message=payload.message.strip(),
        db=db,
        conversation_id=payload.conversation_id,
        current_user=current_user
    )
    return response

@router.get("/conversations", response_model=List[ConversationOut])
def get_user_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.patient_profile:
        return []
    conversations = db.query(Conversation).filter(
        Conversation.patient_id == current_user.patient_profile.id
    ).order_by(Conversation.started_at.desc()).all()
    return conversations

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut])
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    # If conversation is associated with a patient, check permission
    if conversation.patient_id and current_user:
        if not current_user.patient_profile or current_user.patient_profile.id != conversation.patient_id:
            if current_user.role not in ["admin", "receptionist"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this conversation")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    return messages

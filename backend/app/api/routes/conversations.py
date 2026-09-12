import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import (
    ConversationCreate,
    ConversationDetailResponse,
    ConversationResponse,
)
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter()


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation_in: ConversationCreate, db: Session = Depends(get_db)
):
    title = conversation_in.title or "New Conversation"
    conversation = Conversation(title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/", response_model=List[ConversationResponse])

def list_conversations(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    conversations = (
        db.query(Conversation)
        .order_by(Conversation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return conversations


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    conversation = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
        )
    return conversation


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_message(
    conversation_id: uuid.UUID,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
        )

    message = Message(
        conversation_id=conversation_id,
        role=message_in.role,
        content=message_in.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

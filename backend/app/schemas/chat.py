import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ChatMessageInput(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    model: str
    messages: List[ChatMessageInput]
    conversation_id: Optional[uuid.UUID] = None
    options: Optional[Dict[str, Any]] = None

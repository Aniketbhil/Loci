import json
import uuid
from typing import Generator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatStreamRequest
from app.services.ollama_client import ollama_client

router = APIRouter()


@router.post("/stream")
def chat_stream(request: ChatStreamRequest, db: Session = Depends(get_db)):
    conversation = None
    if request.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == request.conversation_id)
            .first()
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        if request.messages and request.messages[-1].role == "user":
            last_msg = request.messages[-1]
            user_msg = Message(
                conversation_id=conversation.id,
                role=last_msg.role,
                content=last_msg.content,
            )
            db.add(user_msg)
            db.commit()

    def sse_chat_generator() -> Generator[str, None, None]:
        accumulated_content = ""
        try:
            messages_payload = [m.model_dump() for m in request.messages]
            for chunk in ollama_client.chat(
                model=request.model,
                messages=messages_payload,
                stream=True,
                options=request.options,
            ):
                content = chunk.get("message", {}).get("content", "")
                done = chunk.get("done", False)
                accumulated_content += content

                event_data = {
                    "content": content,
                    "done": done,
                }
                yield f"data: {json.dumps(event_data)}\n\n"

            if conversation and accumulated_content:
                assistant_msg = Message(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=accumulated_content,
                )
                db.add(assistant_msg)
                db.commit()

        except Exception as e:
            err_payload = {"error": str(e), "done": True}
            yield f"data: {json.dumps(err_payload)}\n\n"

    return StreamingResponse(sse_chat_generator(), media_type="text/event-stream")

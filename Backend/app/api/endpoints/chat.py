import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.db import models, database
from app.schemas import chat as chat_schema
from app.api import dependencies
from app.services.ai_router import stream_chat_query

router = APIRouter()

@router.get("/history", response_model=List[chat_schema.ChatResponse])
def get_chat_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    chats = db.query(models.Chat).filter(models.Chat.user_id == current_user.id).order_by(models.Chat.created_at.desc()).all()
    return chats

@router.post("/stream")
async def stream_chat(
    request: chat_schema.ChatStreamRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # 1. Resolve or create Chat ID
    chat_id = request.chat_id
    if not chat_id:
        new_chat = models.Chat(user_id=current_user.id, title=request.query[:50] + "...")
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        chat_id = new_chat.id
    else:
        # Verify ownership
        chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

    # 2. Save User Message
    user_message = models.Message(chat_id=chat_id, role="user", content=request.query)
    db.add(user_message)
    db.commit()
    
    # 3. Fetch past messages for context
    past_messages = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.created_at.asc()).all()
    messages_payload = [{"role": msg.role, "content": msg.content} for msg in past_messages]

    # 4. Generate Stream
    async def generate():
        ai_full_response = ""
        # Yield the chat ID first so the frontend knows where to attach this stream
        yield f"data: {json.dumps({'chat_id': chat_id})}\n\n"
        
        async for chunk in stream_chat_query(messages_payload, request.query):
            ai_full_response += chunk
            # SSE format: "data: <content>\n\n"
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        # Save AI message to DB when stream is done
        ai_message = models.Message(chat_id=chat_id, role="assistant", content=ai_full_response)
        db.add(ai_message)
        db.commit()
        
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from pydantic import BaseModel
from app.crud.chat import create_chat, add_to_chat
from app.schemas.chats import ChatCreate, ChatResponse, UpdateChat
from app.core.manager import manager


router = APIRouter(prefix="/chat", tags=["Chat"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MessageRequest(BaseModel):
    sender: str
    recipient: str
    content: str

# Handles connections and listens for messages
@router.websocket("/ws/{chat_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str, user_id: int):
    await manager.connect(websocket, chat_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, chat_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id, user_id)
        await manager.broadcast_user_event(chat_id, user_id, "user_left")
    except Exception as e:
        manager.disconnect(websocket, chat_id, user_id)
        await manager.broadcast_user_event(chat_id, user_id, "user_left")

# Creates a new chat
@router.post("/create-chat", response_model=ChatResponse)
async def create(chat_in: ChatCreate, db: Session = Depends(get_db)):
    chat = create_chat(db, chat_in)
    member_ids = [m.user_id for m in chat.memberships]
    return ChatResponse(
        id=chat.id,
        name=chat.name,
        is_group=chat.is_group,
        members=member_ids
    )

# Adds users to existing chat
@router.post("/update-chat")
async def update(chat_in: UpdateChat, db: Session = Depends(get_db)):
    try:
        add_to_chat(chat_in.members, chat_in.id, db)
        return "Successfully added members to chat"
    except Exception as e:
        print(f"Error updating chat: {e}")
        return f"Error adding members to chat: {e}"
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from pydantic import BaseModel
from app.crud.chat import create_chat
from app.models import Chats, ChatMembership
from app.schemas.chats import ChatCreate, ChatResponse


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

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, chat_id: str):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, chat_id: str):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]
    
    async def broadcast(self, message: str, chat_id: str):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await manager.connect(websocket, chat_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, chat_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)

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
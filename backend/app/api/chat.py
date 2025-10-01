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
        print(f"Client connected to chat {chat_id}. Total connections: {len(self.active_connections[chat_id])}")
    
    def disconnect(self, websocket: WebSocket, chat_id: str):
        if chat_id in self.active_connections:
            try:
                self.active_connections[chat_id].remove(websocket)
                print(f"Client disconnected from chat {chat_id}. Remaining: {len(self.active_connections[chat_id])}")
            except ValueError:
                print(f"WebSocket not found in chat {chat_id} connections")
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]
                print(f"Chat {chat_id} has no more connections, removed from manager.")
    
    async def broadcast(self, message: str, chat_id: str):
        if chat_id not in self.active_connections:
            print(f"No active connections for chat {chat_id}")
            return
        
        dead_connections = []
        for connection in self.active_connections[chat_id]:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error sending connection: {e}")
                dead_connections.append(e)
        for dead_conn in dead_connections:
            self.disconnect(dead_conn, chat_id)

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
    except Exception as e:
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
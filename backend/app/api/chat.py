from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from pydantic import BaseModel

router = APIRouter()

class MessageRequest(BaseModel):
    sender: str
    recipient: str
    content: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.post("/send-message")
async def send_message(request: MessageRequest):
    return {
        "status": "success",
        "message": f"Message from {request.sender} to {request.recipient} received: {request.content}"
    }

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        print(data)
        await websocket.send_text(data)

@router.websocket("/ws-broadcast")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
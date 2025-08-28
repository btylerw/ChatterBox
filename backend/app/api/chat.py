from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MessageRequest(BaseModel):
    sender: str
    recipient: str
    content: str

@router.post("/send-message")
async def send_message(request: MessageRequest):
    return {
        "status": "success",
        "message": f"Message from {request.sender} to {request.recipient} received: {request.content}"
    }
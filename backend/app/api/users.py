from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud.chat import get_user_chats
from app.schemas.chats import ChatCreate, ChatResponse

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/chats/{user_id}", response_model=List[ChatResponse])
async def get_chats(user_id: int, db: Session = Depends(get_db)):
    print(user_id)
    chats = get_user_chats(user_id, db)
    response = []
    for chat in chats:
        members = [membership.user_id for membership in chat.memberships]
        response.append(
            ChatResponse(
                id=chat.id,
                name=chat.name,
                is_group=chat.is_group,
                members=members
            )
        )
    return response
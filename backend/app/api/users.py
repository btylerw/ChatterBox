from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud.chat import get_user_chats
from app.schemas.chats import ChatCreate, ChatResponse
from app.schemas.user import SearchUsers
from app.crud.user import search_users, get_users_by_id

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

@router.get("/search_users/", response_model=List[SearchUsers])
async def get_users(q: str = Query(..., min_length=2, max_length=50), db: Session = Depends(get_db)):
    return search_users(db, q)

@router.post("/get_users_by_id", response_model=List[SearchUsers])
async def get_users(user_ids: List[int], db: Session = Depends(get_db)):
    return get_users_by_id(db, user_ids)

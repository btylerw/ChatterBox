from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models import Chats, ChatMembership
from app.schemas.chats import ChatCreate
from typing import List

# Writes a new chat in database
def create_chat(db: Session, chat_in: ChatCreate) -> Chats:
    db_chat = Chats(name=chat_in.name, is_group=chat_in.is_group)
    db.add(db_chat)
    db.flush()
    memberships = [
        ChatMembership(user_id=user_id, chat_id=db_chat.id)
        for user_id in chat_in.user_ids
    ]
    db.add_all(memberships)
    try:
        db.commit()
        db.refresh(db_chat)
        return db_chat
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Error creating new chat"
        )

# Retrieves chats from database
def get_user_chats(user_id: int, db: Session) -> List[Chats]:
    return (
        db.query(Chats)
        .join(ChatMembership, ChatMembership.chat_id == Chats.id)
        .filter(ChatMembership.user_id == user_id)
        .all()
    )

# Updates chats in database
def add_to_chat(user_ids: List[int], chat_id: int, db: Session) -> str:
    memberships = [
        ChatMembership(user_id=user_id, chat_id=chat_id)
        for user_id in user_ids
    ]
    db.add_all(memberships)
    try:
        db.commit()
        return "Successfully added to chat!"
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding user to chat"
        )
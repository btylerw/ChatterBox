from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models import Chats, ChatMembership
from app.schemas.chats import ChatCreate

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
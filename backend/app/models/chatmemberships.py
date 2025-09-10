from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ChatMembership(Base):
    __tablename__ = "chat_memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    chat_id =  Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"))
    role = Column(String(20), default="member")

    user = relationship("User", back_populates="memberships")
    chat  = relationship("Chats", back_populates="memberships")
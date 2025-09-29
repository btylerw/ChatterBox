from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
from typing import List

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_pw = hash_password(user_in.password)
    db_user = User(username=user_in.username, email=user_in.email, hashed_password=hashed_pw)
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered."
        )

def search_users(db: Session, query: str, limit: int = 20) -> List[User]:
    return (
        db.query(User)
        .filter(
            (User.username.ilike(f"%{query}%"))
        ).limit(limit).all()
    )
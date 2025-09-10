from pydantic import BaseModel
from typing import List

class ChatCreate(BaseModel):
    name: str
    is_group: bool
    user_ids: list

class ChatResponse(BaseModel):
    id:  int
    name: str
    is_group: bool
    members: List[int]

    class Config:
        from_attributes = True
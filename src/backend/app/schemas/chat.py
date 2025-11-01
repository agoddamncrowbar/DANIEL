from pydantic import BaseModel
from datetime import datetime


class ChatMessageBase(BaseModel):
    listing_id: int
    receiver_id: int
    message: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    listing_id: int
    message: str
    created_at: datetime

    class Config:
        orm_mode = True

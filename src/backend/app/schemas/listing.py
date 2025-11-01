from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ListingImageRead(BaseModel):
    id: int
    image_url: str
    is_primary: bool

    class Config:
        orm_mode = True

class ListingBase(BaseModel):
    title: str
    description: str
    price: float
    location: str
    category: str

class ListingCreate(ListingBase):
    pass

class ListingRead(ListingBase):
    id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime
    images: List[ListingImageRead] = []

    class Config:
        orm_mode = True

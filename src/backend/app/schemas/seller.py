from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SellerBase(BaseModel):
    business_name: str
    address: str
    logo: Optional[str] = None

class SellerCreate(SellerBase):
    pass

class SellerUpdate(BaseModel):
    business_name: Optional[str] = None
    address: Optional[str] = None
    logo: Optional[str] = None

class SellerRead(SellerBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

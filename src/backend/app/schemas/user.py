from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    profile_picture: Optional[str] = None

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserAdminUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    role: Optional[str]  # should be 'buyer' | 'seller' | 'admin'
    is_active: Optional[bool]
    is_seller_approved: Optional[bool]

class UserAdminRead(UserRead):
    is_active: bool
    is_seller_approved: bool

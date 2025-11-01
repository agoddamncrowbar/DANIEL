from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserRead, LoginRequest
from app.services import auth_service
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login_user(db, data.email, data.password)

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

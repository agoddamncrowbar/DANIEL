from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User, RoleEnum
from app.models.seller import Seller
from app.schemas.user import UserCreate, UserRead
from app.core.security import hash_password, verify_password, create_access_token

def register_user(db: Session, user_data: UserCreate) -> User:

    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role=RoleEnum.buyer,  # default
        password_hash=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "profile_picture": user.profile_picture,
        }
    }

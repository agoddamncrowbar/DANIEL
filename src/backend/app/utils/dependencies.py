from fastapi import Depends, HTTPException, status
from app.models.user import RoleEnum, User
from typing import Optional

# Existing imports...
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(required_roles: list[RoleEnum]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires role in {required_roles}"
            )
        return current_user
    return role_checker




oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)



def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Returns the logged-in user if a valid token is provided.
    Returns None if:
        - no token provided
        - token invalid
        - user not found
    Does NOT raise HTTP exceptions.
    """
    if not token:
        return None

    try:
        payload = decode_access_token(token)
        if not payload:
            return None
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        return user
    except:
        return None

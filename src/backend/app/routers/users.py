from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil
from uuid import uuid4
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.utils.dependencies import get_db, get_current_user
from app.models.seller import Seller, SellerStatus
from app.models.user import User, RoleEnum
from app.schemas.user import UserRead, UserAdminRead, UserAdminUpdate

router = APIRouter()
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).filter(User.is_active == True).all()


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_user_or_404(db, user_id)


@router.put("/{user_id}", response_model=UserRead)
def update_user_profile(
    user_id: int,
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    role: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = get_user_or_404(db, user_id)

    if name:
        user.name = name
    if phone:
        user.phone = phone
    if file:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        user.profile_picture = filename

    # 👇 key difference: user can make themselves a seller
    if role:
        if role not in [r.value for r in RoleEnum]:
            raise HTTPException(status_code=400, detail="Invalid role")

        # Admin can set any role, buyer can only self-upgrade to seller
        if current_user.role == RoleEnum.admin or (
            current_user.id == user.id
            and user.role == RoleEnum.buyer
            and role == RoleEnum.seller.value
        ):
            user.role = role
            # auto-create Seller profile if missing
            if role == RoleEnum.seller.value and not user.seller_profile:
                new_seller = Seller(user_id=user.id)
                db.add(new_seller)
        else:
            raise HTTPException(status_code=403, detail="Not authorized to change role")

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error upgrading to seller")

    db.refresh(user)
    return user

@router.put("/{user_id}/admin", response_model=UserAdminRead)
def admin_update_user(
    user_id: int,
    update_data: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = get_user_or_404(db, user_id)

    if update_data.name is not None:
        user.name = update_data.name
    if update_data.phone is not None:
        user.phone = update_data.phone
    if update_data.role is not None:
        if update_data.role not in [r.value for r in RoleEnum]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = update_data.role
    if update_data.is_active is not None:
        user.is_active = update_data.is_active

    db.commit()
    db.refresh(user)
    return user

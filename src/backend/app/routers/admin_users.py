# app/routers/admin_users.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.schemas.user import UserAdminRead, UserAdminUpdate
from app.utils.dependencies import get_db, require_role, get_current_user

router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])

# dependency that ensures the current user is admin
admin_required = require_role([RoleEnum.admin])

@router.get("/", response_model=List[UserAdminRead], dependencies=[Depends(admin_required)])
def list_users(
    q: Optional[str] = None,
    role: Optional[RoleEnum] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List users for admin with optional filters:
        - q: search by name or email (partial)
        - role: filter by RoleEnum
    Pagination: skip, limit
    """
    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter((User.name.ilike(like)) | (User.email.ilike(like)))
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserAdminRead, dependencies=[Depends(admin_required)])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserAdminRead, dependencies=[Depends(admin_required)])
def update_user(user_id: int, data: UserAdminUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update allowed fields
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.role is not None:
        if data.role not in RoleEnum.__members__:
            # allow string role names like "seller"
            try:
                user.role = RoleEnum(data.role)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid role")
        else:
            user.role = RoleEnum[data.role]
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.is_seller_approved is not None:
        user.is_seller_approved = data.is_seller_approved

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/{user_id}/suspend", dependencies=[Depends(admin_required)])
def suspend_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.add(user)
    db.commit()
    return {"detail": f"User {user.email} suspended"}

@router.post("/{user_id}/activate", dependencies=[Depends(admin_required)])
def activate_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.add(user)
    db.commit()
    return {"detail": f"User {user.email} activated"}

@router.post("/{user_id}/approve-seller", dependencies=[Depends(admin_required)])
def approve_seller(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # set seller flag and approve
    user.role = RoleEnum.seller
    user.is_seller_approved = True
    db.add(user)
    db.commit()
    return {"detail": f"User {user.email} approved as seller"}

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # If you have FK constraints (listings referencing user) you may want to either:
    # - cascade delete listings (dangerous), or
    # - soft-delete the user by setting is_active=False (safer).
    # Here we actually delete:
    db.delete(user)
    db.commit()
    return

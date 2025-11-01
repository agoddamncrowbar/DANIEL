from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os, shutil
from uuid import uuid4

from app.schemas import seller as schemas
from app.models.seller import Seller
from app.models.user import User, RoleEnum
from app.utils.dependencies import get_db, require_role

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()


@router.post("/", response_model=schemas.SellerRead)
def create_seller_profile(
    payload: schemas.SellerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.seller]))
):
    if current_user.seller_profile:
        raise HTTPException(status_code=400, detail="Seller profile already exists")

    seller = Seller(user_id=current_user.id, **payload.dict())
    db.add(seller)
    db.commit()
    db.refresh(seller)
    return seller


@router.get("/me", response_model=schemas.SellerRead)
def read_my_seller_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.seller]))
):
    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    return seller


@router.put("/me", response_model=schemas.SellerRead)
def update_my_seller_profile(
    business_name: str = Form(None),
    address: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.seller]))
):
    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    if business_name is not None:
        seller.business_name = business_name
    if address is not None:
        seller.address = address

    if file:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        seller.logo = filename

    db.commit()
    db.refresh(seller)
    return seller

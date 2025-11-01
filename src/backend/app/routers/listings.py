from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os

from app.schemas.listing import ListingCreate, ListingRead
from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.user import User, RoleEnum
from app.utils.dependencies import get_db, get_current_user

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Browse listings
@router.get("/", response_model=List[ListingRead])
def browse_listings(db: Session = Depends(get_db)):
    return db.query(Listing).all()
# Get current user's listings (only sellers)
@router.get("/my-listings", response_model=List[ListingRead])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.seller or not current_user.seller_profile:
        raise HTTPException(status_code=403, detail="Only sellers can access their listings")
    
    listings = (
        db.query(Listing)
        .filter(Listing.seller_id == current_user.seller_profile.id)
        .all()
    )
    return listings

# Get single listing by ID
@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

# Get listings by seller ID
@router.get("/seller/{seller_id}", response_model=List[ListingRead])
def get_listings_by_seller(
    seller_id: int,
    db: Session = Depends(get_db)
):
    listings = db.query(Listing).filter(Listing.seller_id == seller_id).all()
    if not listings:
        raise HTTPException(status_code=404, detail="No listings found for this seller")
    return listings


# Create listing (only sellers)
@router.post("/", response_model=ListingRead)
def create_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    images: list[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != RoleEnum.seller or not current_user.seller_profile:
        raise HTTPException(status_code=403, detail="Only sellers can create listings")

    new_listing = Listing(
        title=title,
        description=description,
        price=price,
        location=location,
        category=category,
        seller_id=current_user.seller_profile.id,
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    for i, img in enumerate(images):
        file_path = os.path.join(UPLOAD_DIR, img.filename)
        with open(file_path, "wb") as f:
            f.write(img.file.read())
        url_path = f"/uploads/{img.filename}".replace("\\", "/")

        db.add(ListingImage(listing_id=new_listing.id, image_url=url_path, is_primary=(i == 0)))

    db.commit()
    db.refresh(new_listing)
    return new_listing


# Update listing (owner or admin)
@router.put("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    title: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    location: str = Form(None),
    category: str = Form(None),
    images: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if (
        db_listing.seller.user_id != current_user.id
        and current_user.role != RoleEnum.admin
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    if title is not None:
        db_listing.title = title
    if description is not None:
        db_listing.description = description
    if price is not None:
        db_listing.price = price
    if location is not None:
        db_listing.location = location
    if category is not None:
        db_listing.category = category

    if images:
        # clear old images
        db.query(ListingImage).filter(ListingImage.listing_id == db_listing.id).delete()
        for i, img in enumerate(images):
            file_path = os.path.join(UPLOAD_DIR, img.filename)
            with open(file_path, "wb") as f:
                f.write(img.file.read())
            url_path = f"/uploads/{img.filename}".replace("\\", "/")
            db.add(ListingImage(listing_id=db_listing.id, image_url=url_path, is_primary=(i == 0)))

    db.commit()
    db.refresh(db_listing)
    return db_listing


# Delete listing (owner or admin)
@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if (
        db_listing.seller.user_id != current_user.id
        and current_user.role != RoleEnum.admin
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(db_listing)
    db.commit()
    return {"message": f"Listing {listing_id} deleted successfully"}

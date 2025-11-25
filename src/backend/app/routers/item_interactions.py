from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from app.models.item_interaction import ItemInteraction
from app.models.listing import Listing
from app.models.user import User
from sqlalchemy import func
from app.utils.dependencies import get_current_user


from app.schemas.item_interaction import (
    ItemInteractionCreate,
    ItemInteractionRead,
    ListingStatsResponse,
    SellerStatsResponse,
    RecommendationResponse
)
from app.services.item_interaction_service import (
    record_item_interaction,
    get_global_recommendations,
    get_user_recommendations,
    get_listing_stats,
    get_seller_stats,
    get_popularity_scores
)
from app.utils.dependencies import get_db, get_current_user_optional
from app.models.user import User

router = APIRouter()

# ----------------------------------------------------
# 1. RECORD INTERACTIONS
# ----------------------------------------------------
@router.post("/", response_model=ItemInteractionRead)
def create_item_interaction(
    data: ItemInteractionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    return record_item_interaction(db, data, user_id)


# ----------------------------------------------------
# 2. RECOMMENDATION ROUTES
# ----------------------------------------------------
def serialize_listing(l):
    if not l:
        return None

    return {
        "id": l.id,
        "title": l.title,
        "price": l.price,
        "images": [{"image_url": img.image_url} for img in getattr(l, "images", [])],
    }


@router.get("/recommendations/global")
def get_global_recommendations(db: Session = Depends(get_db)):
    interactions = (
        db.query(
            ItemInteraction.listing_id,
            func.sum(ItemInteraction.weight).label("score")
        )
        .group_by(ItemInteraction.listing_id)
        .order_by(func.sum(ItemInteraction.weight).desc())
        .limit(12)
        .all()
    )

    if not interactions:
        return {"recommendations": []}

    listing_ids = [i.listing_id for i in interactions]
    listings = db.query(Listing).filter(Listing.id.in_(listing_ids)).all()
    listing_map = {l.id: l for l in listings}

    results = []
    for i in interactions:
        l = listing_map.get(i.listing_id)
        if not l:
            continue
        results.append({
            "score": float(i.score),
            "listing": serialize_listing(l),
        })

    return {"recommendations": results}


@router.get("/recommendations/user")
def get_user_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    # Aggregate scores by listing
    interactions = (
        db.query(
            ItemInteraction.listing_id,
            func.sum(ItemInteraction.weight).label("score")
        )
        .filter(ItemInteraction.user_id == user_id)
        .group_by(ItemInteraction.listing_id)
        .order_by(func.sum(ItemInteraction.weight).desc())
        .limit(12)
        .all()
    )

    if not interactions:
        return {"recommendations": []}

    # Fetch listings in one query
    listing_ids = [i.listing_id for i in interactions]
    listings = db.query(Listing).filter(Listing.id.in_(listing_ids)).all()
    listing_map = {l.id: l for l in listings}

    results = []
    for i in interactions:
        l = listing_map.get(i.listing_id)
        if not l:
            continue
        results.append({
            "score": float(i.score),
            "listing": serialize_listing(l),
        })

    return {"recommendations": results}



# ----------------------------------------------------
# 3. ANALYTICS & PERFORMANCE (SELLER DASHBOARD)
# ----------------------------------------------------

@router.get("/stats/listing/{listing_id}", response_model=ListingStatsResponse)
def listing_stats(listing_id: int, db: Session = Depends(get_db)):
    """Detailed analytics for a single listing."""
    return get_listing_stats(db, listing_id)

@router.get("/stats/seller/{seller_id}", response_model=SellerStatsResponse)
def seller_stats(seller_id: int, db: Session = Depends(get_db)):
    """Aggregated analytics for all listings belonging to a seller."""
    return get_seller_stats(db, seller_id)


# ----------------------------------------------------
# 4. POPULARITY SCORES FOR SEARCH ENGINE
# ----------------------------------------------------

@router.get("/popularity-scores")
def popularity_scores(db: Session = Depends(get_db)) -> Dict[int, float]:
    """
    Returns a mapping of listing_id -> popularity_score.
    Search feature will use this to push popular & relevant items.
    """
    return get_popularity_scores(db)


@router.get("/audit", tags=["debug"])
def audit_recommendations(db: Session = Depends(get_db)):
    """
    Full audit of recommendation data flow.
    Helps identify why recommendations may be empty.
    """

    # 1. Fetch all interactions
    interactions = (
        db.query(
            ItemInteraction.id,
            ItemInteraction.user_id,
            ItemInteraction.listing_id,
            ItemInteraction.action,
            ItemInteraction.weight,
            ItemInteraction.created_at
        )
        .order_by(ItemInteraction.created_at.desc())
        .all()
    )

    # 2. Aggregate weights per listing
    weight_rows = (
        db.query(
            ItemInteraction.listing_id,
            func.sum(ItemInteraction.weight).label("score")
        )
        .group_by(ItemInteraction.listing_id)
        .all()
    )

    weight_map = {row[0]: float(row[1]) for row in weight_rows}

    # 3. Fetch all valid listings
    listing_rows = (
        db.query(Listing.id, Listing.title, Listing.category)
        .all()
    )

    listing_map = {row.id: {"title": row.title, "category": row.category} for row in listing_rows}

    # 4. Detect invalid references
    invalid_listing_ids = [
        l_id for l_id in weight_map.keys() 
        if l_id not in listing_map
    ]

    # 5. Run global recommendations
    global_recs = get_global_recommendations(db)

    # 6. Run per-user recommendations (if any users exist)
    users = db.query(User).all()

    user_recs = {}
    for u in users:
        user_recs[u.id] = get_user_recommendations(db, u.id)

    # ---- RETURN FULL AUDIT OUTPUT ----
    return {
        "interactions_raw": [
            {
                "id": i.id,
                "listing_id": i.listing_id,
                "action": i.action.value if hasattr(i.action, "value") else i.action,
                "weight": float(i.weight),
                "user_id": i.user_id,
                "created_at": i.created_at
            }
            for i in interactions
        ],
        "aggregated_scores": weight_map,
        "listings": listing_map,
        "invalid_listing_ids": invalid_listing_ids,
        "global_recommendations": [
            rec.dict() for rec in global_recs.recommendations
        ],
        "user_recommendations": {
            uid: [rec.dict() for rec in result.recommendations]
            for uid, result in user_recs.items()
        }
    }

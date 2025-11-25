from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict

from app.schemas.item_interaction import (
    ItemInteractionCreate,
    RecommendationResponse,
    RecommendationItem,
    ListingStatsResponse,
    SellerStatsResponse
)
from app.models.item_interaction import ItemInteraction, InteractionAction
from app.models.listing import Listing
from app.models.user import User


# ----------------------------------------------------
# 1. RECORD AN INTERACTION
# ----------------------------------------------------
def record_item_interaction(
    db: Session,
    data: ItemInteractionCreate,
    user_id: Optional[int]
):
    interaction = ItemInteraction(
        user_id=user_id,
        anonymous_id=data.anonymous_id,
        listing_id=data.listing_id,
        action=data.action,
        weight=data.weight,
        device_type=data.device_type,
        session_id=data.session_id,
    )

    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return interaction


# ----------------------------------------------------
# 2. GLOBAL RECOMMENDATIONS (POPULAR ITEMS)
# ----------------------------------------------------
def get_global_recommendations(db: Session) -> RecommendationResponse:
    """
    Rank listings by total weighted interactions.
    This powers the homefeed trending recommendations.
    """
    rows = (
        db.query(
            ItemInteraction.listing_id,
            func.sum(ItemInteraction.weight).label("score")
        )
        .group_by(ItemInteraction.listing_id)
        .filter(ItemInteraction.listing_id != 0)
        .order_by(func.sum(ItemInteraction.weight).desc())
        .limit(20)
        .all()
    )

    recs = [RecommendationItem(listing_id=row[0], score=row[1]) for row in rows]
    return RecommendationResponse(recommendations=recs)


# ----------------------------------------------------
# 3. USER-PERSONALIZED RECOMMENDATIONS
# ----------------------------------------------------
def get_user_recommendations(db: Session, user_id: Optional[int]) -> RecommendationResponse:
    """
    Personalized recs:
    - If user logged in: find categories they engage with.
    - If anonymous: return global recommendations.
    """

    if not user_id:
        return get_global_recommendations(db)

    # User recent history → categories user engages with
    recent = (
        db.query(
            ItemInteraction.listing_id,
            ItemInteraction.action,
            ItemInteraction.weight,
            Listing.category
        )
        .join(Listing, Listing.id == ItemInteraction.listing_id)
        .filter(ItemInteraction.user_id == user_id)
        .order_by(ItemInteraction.created_at.desc())
        .limit(30)
        .all()
    )

    if not recent:
        return get_global_recommendations(db)

    # Compute category preference score
    category_scores = {}
    for _listing_id, _action, weight, category in recent:
        category_scores[category] = category_scores.get(category, 0) + weight

    # Rank categories
    preferred_categories = sorted(
        category_scores.items(), key=lambda x: x[1], reverse=True
    )

    if not preferred_categories:
        return get_global_recommendations(db)

    top_category = preferred_categories[0][0]

    # Recommend listings from user’s top category
    rows = (
        db.query(
            ItemInteraction.listing_id,
            func.sum(ItemInteraction.weight).label("score")
        )
        .join(Listing, Listing.id == ItemInteraction.listing_id)
        .filter(Listing.category == top_category)
        .group_by(ItemInteraction.listing_id)
        .order_by(func.sum(ItemInteraction.weight).desc())
        .limit(20)
        .all()
    )

    recs = [RecommendationItem(listing_id=row[0], score=row[1]) for row in rows]
    return RecommendationResponse(recommendations=recs)


# ----------------------------------------------------
# 4. LISTING ANALYTICS
# ----------------------------------------------------
def get_listing_stats(db: Session, listing_id: int) -> ListingStatsResponse:
    def count(action: InteractionAction):
        return (
            db.query(func.count(ItemInteraction.id))
            .filter(ItemInteraction.listing_id == listing_id)
            .filter(ItemInteraction.action == action)
            .scalar()
        )

    views = count(InteractionAction.view)
    clicks = count(InteractionAction.click)
    favorites = count(InteractionAction.favorite)
    messages = count(InteractionAction.message_seller)
    purchases = count(InteractionAction.purchase)

    # Popularity formula (simple MVP)
    popularity_score = (
        views * 1 +
        clicks * 2 +
        favorites * 5 +
        messages * 6 +
        purchases * 10
    )

    return ListingStatsResponse(
        listing_id=listing_id,
        total_views=views,
        total_clicks=clicks,
        total_favorites=favorites,
        total_messages=messages,
        total_purchases=purchases,
        popularity_score=popularity_score
    )


# ----------------------------------------------------
# 5. SELLER ANALYTICS (DASHBOARD)
# ----------------------------------------------------
def get_seller_stats(db: Session, seller_id: int) -> SellerStatsResponse:
    listings = db.query(Listing).filter(Listing.seller_id == seller_id).all()

    listing_stats = []
    totals = {
        "views": 0,
        "clicks": 0,
        "favorites": 0,
        "messages": 0,
        "purchases": 0,
        "popularity": 0.0
    }

    for listing in listings:
        stats = get_listing_stats(db, listing.id)
        listing_stats.append(stats)

        totals["views"] += stats.total_views
        totals["clicks"] += stats.total_clicks
        totals["favorites"] += stats.total_favorites
        totals["messages"] += stats.total_messages
        totals["purchases"] += stats.total_purchases
        totals["popularity"] += stats.popularity_score

    avg_popularity = (
        totals["popularity"] / len(listings) if listings else 0
    )

    return SellerStatsResponse(
        seller_id=seller_id,
        total_listings=len(listings),
        listings=listing_stats,
        total_views=totals["views"],
        total_clicks=totals["clicks"],
        total_favorites=totals["favorites"],
        total_messages=totals["messages"],
        total_purchases=totals["purchases"],
        average_popularity=avg_popularity
    )


# ----------------------------------------------------
# 6. POPULARITY SCORES FOR SEARCH RANKING
# ----------------------------------------------------
def get_popularity_scores(db: Session) -> Dict[int, float]:
    rows = (
        db.query(
            ItemInteraction.listing_id,
            func.sum(ItemInteraction.weight).label("score")
        )
        .group_by(ItemInteraction.listing_id)
        .all()
    )

    return {row[0]: float(row[1]) for row in rows}

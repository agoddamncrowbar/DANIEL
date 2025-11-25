from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.item_interaction import InteractionAction
from typing import List, Dict


class ItemInteractionCreate(BaseModel):
    listing_id: int
    action: InteractionAction
    weight: float = 1.0
    device_type: Optional[str] = None
    session_id: Optional[str] = None
    anonymous_id: Optional[str] = None

class ItemInteractionRead(BaseModel):
    id: int
    user_id: Optional[int]
    anonymous_id: Optional[str]
    listing_id: int
    action: InteractionAction
    weight: float
    device_type: Optional[str]
    session_id: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class ListingStatsResponse(BaseModel):
    listing_id: int
    total_views: int
    total_clicks: int
    total_favorites: int
    total_messages: int
    total_purchases: int
    popularity_score: float

class SellerStatsResponse(BaseModel):
    seller_id: int
    total_listings: int
    listings: List[ListingStatsResponse]
    total_views: int
    total_clicks: int
    total_favorites: int
    total_messages: int
    total_purchases: int
    average_popularity: float

class RecommendationItem(BaseModel):
    listing_id: int
    score: float

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
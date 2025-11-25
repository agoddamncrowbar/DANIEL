from sqlalchemy import Column, BigInteger, String, Enum, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

import enum

class InteractionAction(str, enum.Enum):
    view = "view"
    click = "click"
    favorite = "favorite"
    add_to_cart = "add_to_cart"
    purchase = "purchase"
    share = "share"
    message_seller = "message_seller"

class ItemInteraction(Base):
    __tablename__ = "item_interactions"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    anonymous_id = Column(String(128), nullable=True)
    listing_id = Column(BigInteger, ForeignKey("listings.id"), nullable=False)
    action = Column(Enum(InteractionAction), nullable=False)
    weight = Column(Float, nullable=False)
    device_type = Column(String(100), nullable=True)
    session_id = Column(String(128), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", backref="item_interactions")
    listing = relationship("Listing", backref="item_interactions")

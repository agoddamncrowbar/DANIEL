from sqlalchemy import Column, BigInteger, String, Text, ForeignKey, DECIMAL, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    location = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    seller_id = Column(BigInteger, ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    seller = relationship("Seller", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="listing", cascade="all, delete-orphan")


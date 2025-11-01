from sqlalchemy import Column, BigInteger, String, ForeignKey, TIMESTAMP, func, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class SellerStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Seller(Base):
    __tablename__ = "sellers"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(150), nullable=False, default="")
    address = Column(String(255), nullable=False, default="")
    logo = Column(String(255), nullable=True)
    status = Column(Enum(SellerStatus), default=SellerStatus.pending, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="seller_profile")
    listings = relationship("Listing", back_populates="seller", cascade="all, delete-orphan")

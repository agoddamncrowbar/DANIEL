from sqlalchemy import Column, BigInteger, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(BigInteger, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=False)

    listing = relationship("Listing", back_populates="images")

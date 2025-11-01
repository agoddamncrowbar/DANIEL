from sqlalchemy import Column, BigInteger, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(BigInteger, primary_key=True, index=True)
    sender_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(BigInteger, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    listing = relationship("Listing", back_populates="chat_messages")



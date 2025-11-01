from sqlalchemy import Column, BigInteger, String, Enum, TIMESTAMP, func, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class RoleEnum(str, enum.Enum):
    buyer = "buyer"
    seller = "seller"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30))
    role = Column(Enum(RoleEnum), default=RoleEnum.buyer)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    profile_picture = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    seller_profile = relationship("Seller", back_populates="user", uselist=False)

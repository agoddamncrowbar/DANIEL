from sqlalchemy import Column, BigInteger, String, Integer, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base

class SearchQuery(Base):
    __tablename__ = "search_queries"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, nullable=True)
    query = Column(String(255), index=True)
    results_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

from app.core.database import Base, engine
from app.models import user, listing

print("Creating database tables...")
Base.metadata.create_all(bind=engine)

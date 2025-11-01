import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/constructify")
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60

settings = Settings()

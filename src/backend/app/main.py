from fastapi import FastAPI
from app.routers import auth, listings, users, admin_users, sellers, chat, item_interactions
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles

# Make sure uploads folder exists in project root
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Constructify API")

origins = [
    "http://localhost",
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(listings.router, prefix="/listings", tags=["Listings"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(sellers.router, prefix="/sellers", tags=["Sellers"])
app.include_router(chat.router, prefix="/chat", tags=["Chats"])
app.include_router(item_interactions.router, prefix="/interactions", tags=["Item Interactions"])

app.include_router(admin_users.router)
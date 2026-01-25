from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.routers import assessment
from app.db import get_db, db_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect on startup
    await get_db()
    yield
    # Disconnect on shutdown
    if db_manager.client.is_connected():
        await db_manager.client.disconnect()

app = FastAPI(title="UdaanSetu Assessment Engine", lifespan=lifespan)

# CORS config to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "UdaanSetu Backend is Running (Modularized)"}

# Include Routers
app.include_router(assessment.router, prefix="/api/assessment", tags=["Assessment"])
from app.api.routers import chat, user
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(user.router, prefix="/api/user", tags=["User"])

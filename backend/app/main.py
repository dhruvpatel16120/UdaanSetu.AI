from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import assessment

app = FastAPI(title="UdaanSetu Assessment Engine")

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
from app.api.routers import chat
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

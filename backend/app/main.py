from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(override=True)

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

from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import BaseAPIException
from app.core.handlers import api_exception_handler, validation_exception_handler, generic_exception_handler

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Exception Handlers
app.add_exception_handler(BaseAPIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/")
def read_root():
    return {"message": "UdaanSetu Backend is Running (Modularized)"}

# Include Routers
app.include_router(assessment.router, prefix="/api/assessment", tags=["Assessment"])
from app.api.routers import chat, user, roadmap
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Career Roadmap"])

from app.api.routers import market
app.include_router(market.router, prefix="/api/market", tags=["Market Intelligence"])


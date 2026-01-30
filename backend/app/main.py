from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(override=True)

from app.api.routers import assessment

app = FastAPI(title="UdaanSetu Assessment Engine")


# CORS config to allow frontend communication
# Note: allow_origins=["*"] is not compatible with allow_credentials=True
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,https://udaansetuai.vercel.app").split(",")
origins = [origin.strip() for origin in raw_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
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

from app.api.routers import assessment, user, career, mentor

# Include Routers (Maintenance of existing prefixes for frontend compatibility)
app.include_router(assessment.router, prefix="/api/assessment", tags=["Pillar 1: Assessment"])
app.include_router(user.router, prefix="/api/user", tags=["Pillar 2: Profile"])
app.include_router(career.router, prefix="/api/roadmap", tags=["Pillar 3: Career"])
app.include_router(career.router, prefix="/api/market", tags=["Pillar 3: Market"])
app.include_router(mentor.router, prefix="/api/chat", tags=["Pillar 4: Mentor"])


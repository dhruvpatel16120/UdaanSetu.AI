from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.mentor_logic.mentor_engine import mentor_engine
from app.services.db_firebase import init_firebase, get_career_report, get_assessment_result, get_user_profile
from firebase_admin import firestore
import firebase_admin
import asyncio

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    language: str = "en"  # "en" or "gu"
    history: List[Dict[str, str]] = []  # [{"role": "user", "content": "..."}, ...]
    user_bio_profile: Optional[Dict] = None

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    """
    Streaming Chat with the AI Mentor.
    """
    # 1. Fetch Rich Context in Parallel
    student_profile = {}
    career_report = {}
    assessment_result = {}

    try:
        # If frontend sends bio, use it, else fetch
        fetch_tasks = []
        if not request.user_bio_profile:
            fetch_tasks.append(get_user_profile(request.user_id))
        else:
            student_profile = request.user_bio_profile
            # Mock task to keep index alignment if needed, or just skip
        
        # Always try to fetch these for "Magic Context"
        fetch_tasks.append(get_career_report(request.user_id))
        fetch_tasks.append(get_assessment_result(request.user_id))

        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

        # Unpack results safely
        idx = 0
        if not request.user_bio_profile:
            if isinstance(results[idx], dict): student_profile = results[idx]
            idx += 1
        
        if idx < len(results) and isinstance(results[idx], dict): career_report = results[idx]
        if idx + 1 < len(results) and isinstance(results[idx+1], dict): assessment_result = results[idx+1]

    except Exception as e:
        print(f"Context Fetch Error: {e}")

    # 2. Return Streaming Response
    async def generate():
        async for chunk in mentor_engine.chat(
            history=request.history,
            student_profile=student_profile or {},
            career_report=career_report,
            assessment_result=assessment_result,
            query=request.message,
            language=request.language
        ):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")

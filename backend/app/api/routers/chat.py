from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.chat_mentor import mentor_service
from app.services.db_firebase import init_firebase
from firebase_admin import firestore
import firebase_admin

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    language: str = "en" # "en" or "gu"
    history: List[Dict[str, str]] = [] # [{"role": "user", "content": "..."}, ...]

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    """
    Streaming Chat with the AI Mentor.
    """
    # 1. Fetch User's Assessment Data
    try:
        if not firebase_admin._apps:
            init_firebase()
        
        db = firestore.client()
        doc = db.collection("users").document(request.user_id).get()
        student_data = doc.to_dict().get("assessment_result", {}) if doc.exists else {}
    except Exception as e:
        print(f"DB Error: {e}")
        student_data = {}

    # 2. Return Streaming Response
    async def generate():
        async for chunk in mentor_service.chat_with_mentor(
            history=request.history,
            student_profile=student_data,
            query=request.message,
            language=request.language
        ):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")

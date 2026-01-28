from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.module3.mentor_engine import mentor_engine
from app.services.db_firebase import init_firebase
from firebase_admin import firestore
import firebase_admin

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
    # 1. Determine User Profile
    student_data = {}
    if request.user_bio_profile:
        # Use provided profile if available
        student_data = request.user_bio_profile
    else:
        # Fallback to Firestore
        try:
            if not firebase_admin._apps:
                init_firebase()
            
            db = firestore.client()
            doc = db.collection("assessments").document(request.user_id).get()
            if doc.exists:
                data = doc.to_dict()
                student_data = data.get("assessment_result", {})
                if not student_data:
                     # Fallback to general bio in the document
                     student_data = data.get("generated_bio", {})

        except Exception as e:
            print(f"DB Error: {e}")
            student_data = {}

    # 2. Return Streaming Response
    async def generate():
        async for chunk in mentor_engine.chat(
            history=request.history,
            student_profile=student_data,
            query=request.message,
            language=request.language
        ):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")

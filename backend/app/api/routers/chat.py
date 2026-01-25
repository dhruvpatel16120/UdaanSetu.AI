from fastapi import APIRouter, HTTPException
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

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat with the AI Mentor based on the student's existing assessment report.
    """
    # 1. Fetch User's Assessment Data from Firebase
    try:
        if not firebase_admin._apps:
            init_firebase()
        
        db = firestore.client()
        doc = db.collection("users").document(request.user_id).get()
        
        if not doc.exists:
            # Fallback for testing without DB or if user not found
            # raise HTTPException(status_code=404, detail="User assessment not found. Please complete assessment first.")
             print(f"User {request.user_id} not found in DB. Using fallback empty context.")
             student_data = {}
        else:
            student_data = doc.to_dict().get("assessment_result", {})
            
    except Exception as e:
        print(f"DB Error: {e}")
        student_data = {}

    # 2. Call AI
    ai_response = await mentor_service.chat_with_mentor(
        history=request.history,
        student_profile=student_data,
        query=request.message,
        language=request.language
    )
    
    return {"response": ai_response}

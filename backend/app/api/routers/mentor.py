from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict
from app.services.ai_service import get_mentor_guidance
from app.services.rag_engine import get_rag_engine
from app.services.db_firebase import get_user_profile

router = APIRouter()

@router.post("/chat")
async def mentor_chat(
    payload: Dict = Body(...),
    x_firebase_id: Optional[str] = Header(None)
):
    """Personalized AI Mentorship (Pillar 4)."""
    uid = x_firebase_id or "anonymous"
    query = payload.get("message", "")
    
    if not query:
        raise HTTPException(status_code=400, detail="Message is required")

    # 1. Get User Context
    user_data = await get_user_profile(uid) or {}
    
    # 2. Get Knowledge Base Context (RAG)
    rag = get_rag_engine()
    kb_context = rag.search(query, k=3)
    
    # 3. Get AI Guidance
    response = await get_mentor_guidance(query, user_data, kb_context)
    
    return {"response": response}

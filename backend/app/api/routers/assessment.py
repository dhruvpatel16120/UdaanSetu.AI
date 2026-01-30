"""
================================================================================
UdaanSetu.AI - API Layer: Adaptive Intelligence Assessment
================================================================================
File: assessment.py
Purpose: Exposes endpoints for the dynamic Q&A engine.
Endpoints:
- /start: Initialize session and get first question.
- /answer: Submit an answer and get the next adaptive question.
- /profile: Finalize the assessment and generate the Intelligence Profile.
================================================================================
"""

from fastapi import APIRouter, Header, HTTPException, Body
from typing import List, Optional, Dict
from app.models.schemas import Answer, IntelligenceProfile
from app.assessment_logic.qa_engine import start_assessment, process_answer, generate_final_profile

router = APIRouter()

@router.get("/config")
async def api_get_config():
    """Returns assessment configuration and question bank."""
    from app.data.Que_Bank.question_bank import get_questions
    import os
    return {
        "max_questions": int(os.getenv("ASSESSMENT_QUESTION_COUNT", 15)),
        "features": ["adaptive_branching", "weighted_scoring", "bilingual_synthesis"],
        "questions": get_questions()
    }

@router.post("/start")
async def api_start_assessment(
    x_firebase_id: Optional[str] = Header(None)
):
    """Initializes a new assessment session."""
    user_id = x_firebase_id or "demo_user_123"
    result = await start_assessment(user_id)
    return result

@router.post("/answer")
async def api_process_answer(
    payload: Dict = Body(...),
    x_firebase_id: Optional[str] = Header(None)
):
    """
    Processes a single answer and returns the next dynamic question.
    Payload: { "answers": [...current history...] }
    """
    user_id = x_firebase_id or "demo_user_123"
    answers_raw = payload.get("answers", [])
    current_answers = [Answer(**a) for a in answers_raw]
    
    result = await process_answer(user_id, current_answers)
    return result

@router.post("/profile")
async def api_generate_profile(
    payload: Dict = Body(...),
    x_firebase_id: Optional[str] = Header(None)
):
    """
    Finalizes the assessment and returns the high-impact Intelligence Profile.
    Payload: { "answers": [...full history...] }
    """
    user_id = x_firebase_id or "demo_user_123"
    answers_raw = payload.get("answers", [])
    all_answers = [Answer(**a) for a in answers_raw]
    
    profile = await generate_final_profile(user_id, all_answers)
    return profile

# --- Legacy Compatibility / Utility ---

@router.get("/result/{user_id}")
async def get_stored_profile(user_id: str):
    """Fetches the pre-generated intelligence profile from Firestore."""
    from app.services.db_firebase import get_assessment_result
    result = await get_assessment_result(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Intelligence Profile not found")
    return result

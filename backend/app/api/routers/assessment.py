from fastapi import APIRouter, Header, HTTPException, Body
from typing import List, Optional, Dict
from app.services.assessment_engine import assessment_service
from app.services.db_firebase import save_assessment_result, get_user_profile, save_user_profile

router = APIRouter()

@router.get("/config")
async def get_assessment_config():
    """Returns assessment metadata."""
    from app.data.Que_Bank.question_bank import get_questions
    from app.services.assessment_engine import MAX_QUESTIONS
    return {
        "questions": get_questions(),
        "total_required": MAX_QUESTIONS
    }

@router.post("/start")
async def start_assessment(x_firebase_id: Optional[str] = Header(None)):
    """Initializes assessment session."""
    uid = x_firebase_id or "anonymous"
    first_q = assessment_service.get_next_question([])
    return {"status": "started", "uid": uid, "first_question": first_q}

@router.post("/answer")
async def process_answer(
    payload: Dict = Body(...),
    x_firebase_id: Optional[str] = Header(None)
):
    """Processes an answer and returns the next question."""
    uid = x_firebase_id or "anonymous"
    answers = payload.get("answers", [])
    last_answer = answers[-1] if answers else None
    
    answered_ids = [a["question_id"] for a in answers]
    next_q = assessment_service.get_next_question(answered_ids, last_answer)
    
    return {"next_question": next_q, "session_complete": next_q is None}

@router.post("/profile")
async def finalize_assessment(
    payload: Dict = Body(...),
    x_firebase_id: Optional[str] = Header(None)
):
    """Finalizes assessment and generates the bio-profile (Pillar 1 & 2)."""
    uid = x_firebase_id or "anonymous"
    answers = payload.get("answers", [])
    
    # Get basic info from user profile for bio generation
    user_data = await get_user_profile(uid) or {}
    
    result = await assessment_service.finalize_assessment(uid, answers, user_data)
    
    # Persistent storage
    await save_assessment_result(uid, result)
    
    # Update user profile with summary for dashboard
    dashboard_update = {
        "professional_summary": result["profile"].get("professional_summary"),
        "skillset": result["profile"].get("skillset"),
        "top_recommendation": result["profile"].get("recommended_fields", ["Career Discovery"])[0]
    }
    await save_user_profile(uid, dashboard_update)
    
    return result
@router.get("/status")
async def get_assessment_status(x_firebase_id: Optional[str] = Header(None)):
    """Checks if the user has completed the assessment and generated a career report."""
    uid = x_firebase_id or "anonymous"
    if uid == "anonymous":
        return {"has_assessment": False, "has_report": False}
    
    # Check Firestore for existing assessment/report
    from firebase_admin import firestore
    from app.services.db_firebase import init_firebase
    import firebase_admin
    
    if not firebase_admin._apps:
        init_firebase()
        
    db = firestore.client()
    
    # Check assessment collection
    assessment_doc = db.collection("assessments").document(uid).get()
    
    # Also check career_reports collection
    report_doc = db.collection("career_reports").document(uid).get()
    
    return {
        "has_assessment": assessment_doc.exists,
        "has_report": report_doc.exists
    }

@router.get("/result/{user_id}")
async def get_assessment_result_endpoint(user_id: str):
    """Retrieves the psychometric assessment results for a specific user."""
    from app.services.db_firebase import get_assessment_result
    result = await get_assessment_result(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assessment results not found")
    return result

@router.get("/report/{user_id}")
async def get_career_report_endpoint(user_id: str):
    """Retrieves the generated career report for a specific user."""
    from app.services.db_firebase import get_career_report
    result = await get_career_report(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Career report not found")
    return result

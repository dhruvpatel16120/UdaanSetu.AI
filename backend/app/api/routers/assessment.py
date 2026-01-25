from fastapi import APIRouter, HTTPException
from typing import List
import random
from app.models.schemas import Question, Answer
from app.data.question_bank import get_questions
from app.services.assessment_engine import process_assessment_submission

router = APIRouter()

@router.get("/questions", response_model=List[Question])
def get_all_questions():
    """
    Get questions for the assessment.
    Returns:
    - Static questions (managed by frontend logic mostly, but sent here if needed)
    - Random selection of 15 dynamic questions from the larger bank
    """
    all_questions = get_questions()
    
    # Separate static and dynamic
    static_qs = [q for q in all_questions if q["section"] == "Static Layer"]
    dynamic_qs = [q for q in all_questions if q["section"] != "Static Layer"]
    
    # Randomly select up to 15 dynamic questions
    # ensure we don't crash if we have fewer than 15
    count = min(len(dynamic_qs), 15)
    selected_dynamic = random.sample(dynamic_qs, count)
    
    # Return combined list (Static + 15 Random Dynamic)
    # The frontend filters out 'Static Layer' anyway if Basic Info is used,
    # but this ensures the API contract remains valid.
    return static_qs + selected_dynamic

@router.get("/question/{question_id}", response_model=Question)
def get_question(question_id: str):
    questions = get_questions()
    for q in questions:
        if q["id"] == question_id:
            return q
    raise HTTPException(status_code=404, detail="Question not found")

@router.post("/submit")
async def submit_assessment(answers: List[Answer]):
    """
    Receive answers and generate a bio-data profile.
    This is where the 'Logic' happens.
    """
    return await process_assessment_submission(answers)

@router.get("/report/{user_id}")
def get_assessment_report(user_id: str):
    """
    Get the generate report for a user.
    """
    from app.services.db_firebase import init_firebase
    from firebase_admin import firestore
    import firebase_admin

    try:
        if not firebase_admin._apps:
            init_firebase()
        
        db = firestore.client()
        doc = db.collection("users").document(user_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            return data.get("assessment_result", {}).get("generated_bio", {}).get("ai_report", {})
        else:
            raise HTTPException(status_code=404, detail="Report not found")
            
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/result/{user_id}")
def get_assessment_result_endpoint(user_id: str):
    """
    Retrieve the bio-data profile for a specific user.
    """
    from app.services.db_firebase import get_assessment_result
    result = get_assessment_result(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assessment result not found")
    return result

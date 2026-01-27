from fastapi import APIRouter, Header, HTTPException, Body
from typing import List, Optional
from app.models.schemas import Answer
from app.data.question_bank import get_questions
from app.module1.qa_engine import get_next_dynamic_question, process_assessment_submission, QUESTION_LIMIT
from app.services.db_firebase import get_assessment_result

router = APIRouter()

@router.get("/config")
async def get_assessment_config():
    return {
        "max_questions": QUESTION_LIMIT,
        "features": ["ai_branching", "random_start", "local_navigation"],
        "questions": get_questions()
    }

@router.get("/question/{question_id}")
async def get_question(question_id: str):
    """
    Get a specific question by ID. 
    If 'random' is passed, pick an initial question randomly.
    """
    all_questions = get_questions()
    
    if question_id == "start" or question_id == "random":
        # Simulate an empty session to get the first dynamic question
        q = await get_next_dynamic_question([])
        return q

    q = next((q for q in all_questions if q["id"] == question_id), None)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@router.post("/next-question")
async def next_question(
    # history: List[Answer] = Body(...),
    # For now, frontend might only send current answer. 
    # We ideally need history to make it "AI powered".
    # I'll update the expected body to handle history if provided.
    payload: dict = Body(...)
):
    """
    Determines the next question based on the history of answers.
    Payload should include 'answers' list.
    """
    answers_raw = payload.get("answers", [])
    # If the frontend only sends the last answer, we can't easily do AI branching without session state.
    # However, I'll adapt to both.
    
    current_answers = []
    for a in answers_raw:
        current_answers.append(Answer(**a))

    # If payload only has one answer as 'current', wrap it
    if not answers_raw and "question_id" in payload:
        current_answers = [Answer(**payload)]

    next_q = await get_next_dynamic_question(current_answers)
    return next_q

@router.post("/submit")
async def submit_assessment(
    answers: List[Answer],
    x_firebase_id: Optional[str] = Header(None)
):
    if not x_firebase_id:
        # Fallback for testing
        x_firebase_id = "demo_user_123"
        
    result = await process_assessment_submission(answers, x_firebase_id)
    return result

@router.get("/result/{user_id}")
async def get_result(user_id: str):
    result = await get_assessment_result(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

@router.post("/generate-report/{user_id}")
async def generate_report_manual(user_id: str):
    """
    Manually triggers Module 2 Career Generation on existing assessment data.
    Useful if the report is missing or needs an update.
    """
    from app.module2.career_generator import generate_career_report
    from app.services.db_firebase import save_assessment_result, save_user_profile
    
    # 1. Fetch existing assessment
    assessment = await get_assessment_result(user_id)
    if not assessment or not assessment.get('analysis'):
        raise HTTPException(status_code=404, detail="Assessment not found. Please complete assessment first.")
        
    analysis = assessment.get('analysis')
    basic_info = analysis.get('basic_info', {})
    
    # 2. Generate Report
    career_report = await generate_career_report(analysis, basic_info)
    
    # 3. Update Assessment Document
    if not assessment.get("generated_bio"): assessment["generated_bio"] = {}
    assessment["generated_bio"]["ai_report"] = career_report
    await save_assessment_result(user_id, assessment)
    
    # 4. Save to Dedicated Collection
    from app.services.db_firebase import save_career_report
    await save_career_report(user_id, career_report)
    
    return {"status": "success", "report": career_report}

@router.get("/report/{user_id}")
async def get_career_report_endpoint(user_id: str):
    from app.services.db_firebase import get_career_report
    report = await get_career_report(user_id)
    if not report:
         raise HTTPException(status_code=404, detail="Report not generated yet")
    return report

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from question_bank import get_questions, INITIAL_QUESTIONS

app = FastAPI(title="UdaanSetu Assessment Engine")

# CORS config to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QuestionOption(BaseModel):
    id: str
    text: Dict[str, str] # {"en": "...", "gu": "..."}
    traits: Optional[Dict[str, str]] = None

class Question(BaseModel):
    id: str
    section: str
    type: str # single_choice, text, etc.
    text: Dict[str, str]
    options: Optional[List[QuestionOption]] = None
    next_question_id: Optional[str] = None

class Answer(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    text_answer: Optional[str] = None

class AssessmentState(BaseModel):
    current_question_id: str
    answers: List[Answer]
    # In a real app, we might store computed traits here too

@app.get("/")
def read_root():
    return {"message": "UdaanSetu Backend is Running"}

@app.get("/api/assessment/questions", response_model=List[Question])
def get_all_questions():
    """
    Get questions for the assessment.
    Returns:
    - Static questions (managed by frontend logic mostly, but sent here if needed)
    - Random selection of 15 dynamic questions from the larger bank
    """
    import random
    
    all_questions = get_questions()
    
    # Separate static and dynamic
    static_qs = [q for q in all_questions if q["section"] == "Static Layer"]
    dynamic_qs = [q for q in all_questions if q["section"] != "Static Layer"]
    
    # Randomly select up to 15 dynamic questions
    # ensure we don't crash if we have fewer than 15
    count = min(len(dynamic_qs), 1)
    selected_dynamic = random.sample(dynamic_qs, count)
    
    # Return combined list (Static + 15 Random Dynamic)
    # The frontend filters out 'Static Layer' anyway if Basic Info is used,
    # but this ensures the API contract remains valid.
    return static_qs + selected_dynamic

@app.get("/api/assessment/question/{question_id}", response_model=Question)
def get_question(question_id: str):
    questions = get_questions()
    for q in questions:
        if q["id"] == question_id:
            return q
    raise HTTPException(status_code=404, detail="Question not found")

@app.post("/api/assessment/submit")
def submit_assessment(answers: List[Answer]):
    """
    Receive answers and generate a bio-data profile.
    This is where the 'Logic' happens.
    """
    questions_map = {q["id"]: q for q in get_questions()}
    
    # Initialize scores
    trait_scores = {}
    
    # Simple scoring logic: Aggregate trait counts/values
    # Also capture key bio-data directly
    education_level = "Unknown"
    
    for ans in answers:
        q = questions_map.get(ans.question_id)
        if not q:
            continue
            
        # Capture Education Level specifically for the Bio
        if ans.question_id == "q1_edu_level" and ans.selected_option_id:
             for opt in q.get("options", []):
                if opt["id"] == ans.selected_option_id:
                     education_level = opt["text"]["en"]

        if ans.selected_option_id and "options" in q:
            for opt in q["options"]:
                if opt["id"] == ans.selected_option_id:
                    if "traits" in opt:
                        for trait, value in opt["traits"].items():
                            # For simplified scoring, we just store the value
                            # If multiple questions target the same trait, we might list them or overwrite
                            # Here we assume unique primary traits per option, or we aggregate specific ones like 'risk_score'
                            trait_scores[trait] = value
                            
    # 2. Generate Profile Data Structure
    # This matches the "Student Bio Profile" from context.txt
    student_profile = {
        "status": "complete",
        "generated_bio": {
            "education": education_level,
            "traits": trait_scores,
            # Placeholder: In next step we will use RAG to generate these paths
            "suggested_paths": ["Pending Analysis..."] 
        },
        "raw_answers": [ans.dict() for ans in answers]
    }
    
    # Save to "Database"
    # Using a fixed ID for now as we don't have Auth token yet.
    # In production, this would be: user_id = request.user.id
    user_id = "demo_user_123" 
    
    from firebase_utils import save_assessment_result
    save_assessment_result(user_id, student_profile)
    
    
    return student_profile

@app.get("/api/assessment/result/{user_id}")
def get_assessment_result_endpoint(user_id: str):
    """
    Retrieve the bio-data profile for a specific user.
    """
    from firebase_utils import get_assessment_result
    result = get_assessment_result(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assessment result not found")
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

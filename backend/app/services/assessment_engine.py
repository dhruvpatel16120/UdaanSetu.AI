from typing import List
from app.data.question_bank import get_questions
from app.models.schemas import Answer
from app.services.db_firebase import save_assessment_result

async def process_assessment_submission(answers: List[Answer], user_id: str = "demo_user_123"):
    """
    Business Logic for processing assessment.
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
    
    # --- AI INTEGRATION START ---
    from app.services.gemini_service import generate_career_report
    
    # Temporary profile to send to AI
    temp_profile = {
        "generated_bio": {
            "education": education_level,
            "traits": trait_scores
        }
    }
    
    # Call Gemini (this might take a few seconds)
    print("Analyzing profile with Gemini...")
    ai_report = await generate_career_report(temp_profile)
    
    student_profile = {
        "status": "complete",
        "generated_bio": {
            "education": education_level,
            "traits": trait_scores,
            "ai_report": ai_report  # Store the full AI report here
        },
        "raw_answers": [ans.dict() for ans in answers]
    }
    # --- AI INTEGRATION END ---
    
    # Save to "Database" (Original Firebase logic)
    save_assessment_result(user_id, student_profile)
    
    # Save to PostgreSQL via Prisma if user is authenticated
    if user_id and user_id != "demo_user_123":
        try:
            from app.services.user_service import get_user_by_firebase_id, save_assessment_to_profile
            user = await get_user_by_firebase_id(user_id)
            if user:
                await save_assessment_to_profile(user.id, student_profile)
        except Exception as e:
            print(f"Error saving to Prisma: {e}")
    
    return student_profile

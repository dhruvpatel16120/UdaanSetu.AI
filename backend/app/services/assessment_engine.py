import os
import random
from typing import List, Optional
from app.data.question_bank import get_questions
from app.models.schemas import Answer
from app.services.db_firebase import save_assessment_result
import google.generativeai as genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

QUESTION_LIMIT = int(os.getenv("ASSESSMENT_QUESTION_COUNT", 3))

def get_session_history_summary(answers: List[Answer]) -> str:
    """Helper to summarize what we know so far for the AI."""
    summary = []
    questions = {q["id"]: q for q in get_questions()}
    for ans in answers:
        q = questions.get(ans.question_id)
        if not q: continue
        val = ans.text_answer or ans.selected_option_id
        summary.append(f"Q: {q['text']['en']} | A: {val}")
    return "\n".join(summary)

async def get_next_dynamic_question(current_answers: List[Answer]) -> Optional[dict]:
    """
    AI-Powered logic to determine the next best question.
    1. Check if limit reached.
    2. If first question, pick randomly.
    3. If not, ask Gemini to pick the next most relevant question ID from the bank.
    """
    all_questions = get_questions()
    asked_ids = [a.question_id for a in current_answers]
    
    # 1. Check Limit
    if len(current_answers) >= QUESTION_LIMIT:
        return None

    # 2. Pick First Question Randomly (from a logic-heavy pool)
    if not current_answers:
        start_pool = ["q1_edu_level", "q3_family_type", "q5_interest", "q7_mindset_games"]
        choice = random.choice(start_pool)
        return next((q for q in all_questions if q["id"] == choice), all_questions[0])

    # 3. AI Selection for next question
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        history = get_session_history_summary(current_answers)
        available_qs = [q for q in all_questions if q["id"] not in asked_ids]
        
        if not available_qs:
            return None
            
        q_list_str = "\n".join([f"- {q['id']}: {q['text']['en']} (Section: {q['section']})" for q in available_qs])
        
        prompt = f"""
        You are the logic engine for UdaanSetu.AI career assessment. 
        Based on the user's previous answers, pick the single most relevant next question ID from the list below.
        
        Previous History:
        {history}
        
        Available Questions:
        {q_list_str}
        
        Return ONLY the question ID. No explanation.
        """
        
        response = model.generate_content(prompt)
        next_id = response.text.strip()
        
        # Validation
        matched_q = next((q for q in available_qs if q["id"] == next_id), None)
        if matched_q:
            return matched_q
            
        # Fallback to random if AI hallucinated
        return random.choice(available_qs)
        
    except Exception as e:
        print(f"AI Selection failed, falling back: {e}")
        # Fallback to simple random selection from remaining
        remaining = [q for q in all_questions if q["id"] not in asked_ids]
        return random.choice(remaining) if remaining else None

async def process_assessment_submission(answers: List[Answer], user_id: str = "demo_user_123"):
    """
    Finalize assessment: generate profile via AI and save.
    """
    questions_map = {q["id"]: q for q in get_questions()}
    profile = {
        "user_id": user_id,
        "raw_answers": [a.dict() for a in answers],
        "traits": {},
        "summary": ""
    }
    
    # Extract traits and calculate scores
    scores = {"tech_affinity": 5, "clarity": 5, "ambition": 5, "confidence": 5, "financial_awareness": 5}
    
    # 1. Analyze text answers for clarity and depth
    total_words = 0
    text_answer_count = 0
    
    # 2. Analyze all answers
    for ans in answers:
        q = questions_map.get(ans.question_id)
        if not q: continue
        
        # Text Analysis
        if q["type"] == "text" and ans.text_answer:
             word_count = len(ans.text_answer.split())
             total_words += word_count
             text_answer_count += 1
             if word_count > 10: scores["clarity"] += 15
             elif word_count > 5: scores["clarity"] += 8
             
             # Vision / Ambition keyword check
             if "vision" in ans.question_id or "positive" in ans.question_id:
                 lower_ans = ans.text_answer.lower()
                 if any(w in lower_ans for w in ["leader", "business", "company", "ceo", "crore", "rich"]):
                     scores["ambition"] += 20
                 if any(w in lower_ans for w in ["help", "service", "teach", "doctor", "police"]):
                     scores["ambition"] += 10

        # Option Analysis
        if "options" in q:
            for opt in q["options"]:
                if opt["id"] == ans.selected_option_id:
                    # Update Traits
                    if "traits" in opt:
                        profile["traits"].update(opt["traits"])
                    
                    # --- SCORING RULES ---
                    # Tech Affinity
                    if opt["id"] in ["tech", "building", "science"]: scores["tech_affinity"] += 25
                    if opt["id"] in ["playing", "arts"]: scores["tech_affinity"] += 5

                    # Ambition & Finance
                    if opt["id"] == "high": 
                        scores["financial_awareness"] += 30
                        scores["ambition"] += 20
                    if opt["id"] == "mid":
                        scores["financial_awareness"] += 15
                        scores["ambition"] += 10
                    
                    # Confidence (Academic/Mobility)
                    if opt["id"] in ["excellent", "top_tier"]: scores["confidence"] += 25
                    if opt["id"] in ["average", "mid_tier"]: scores["confidence"] += 10
                    if opt["id"] == "yes": scores["confidence"] += 15  # Relocation = Confidence

    # Normalize scores to 0-100 cap
    profile["scores"] = {k: min(v, 100) for k, v in scores.items()}
    
    # Calculate overall readiness (average of non-zero scores or base fallbacks)
    non_zero_scores = [v for v in profile["scores"].values() if v > 5]
    if non_zero_scores:
        profile["overall_score"] = sum(non_zero_scores) // len(non_zero_scores)
    else:
        profile["overall_score"] = 40 # Basic baseline

    # Generate AI Career Report
    from app.services.gemini_service import generate_career_report
    ai_report = await generate_career_report({"generated_bio": profile})
    
    # Ensure ai_report has a readiness score if it returned fallback
    if "careerReadiness" not in ai_report:
         ai_report["careerReadiness"] = profile["overall_score"]

    result = {
        "status": "complete",
        "generated_bio": {
            **profile,
            "ai_report": ai_report
        }
    }
    
    save_assessment_result(user_id, result)
    return result

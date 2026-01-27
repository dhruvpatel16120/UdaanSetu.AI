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
        # Upgrade to latest Flash model for better logic
        model = genai.GenerativeModel("gemini-1.5-flash")
        history = get_session_history_summary(current_answers)
        available_qs = [q for q in all_questions if q["id"] not in asked_ids]
        
        if not available_qs:
            return None
            
        q_list_str = "\n".join([f"- {q['id']}: {q['text']['en']} (Section: {q['section']})" for q in available_qs])
        
        prompt = f"""
        ROLE: Expert Career Counselor & Psychologist.
        TASK: Select the NEXT BEST question to ask a student to determine their ideal career path.
        
        STRATEGY:
        - If they show technical interest, drill down into technical topics.
        - If they show artistic interest, ask about creativity.
        - If they are unsure, ask broad psychological questions.
        
        Previous Dialog:
        {history}
        
        Available Questions to Choose From:
        {q_list_str}
        
        OUTPUT:
        Return ONLY the exact ID of the question to ask next. Do not output anything else.
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
    # Base scores start at 10 to avoid 0s
    scores = {
        "tech_affinity": 10,       # Interest in Tech
        "tech_competence": 10,     # 'Tech' - Actual skill/knowledge
        "clarity": 10,            # Clarity of thought
        "ambition": 10,           # Drive/Goals
        "confidence": 10,         # Self-belief
        "financial_awareness": 10 # Money smarts
    }
    
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
             
             # Clarity based on length (but not too long)
             if word_count > 8: scores["clarity"] += 10
             elif word_count > 4: scores["clarity"] += 5
             
             lower_ans = ans.text_answer.lower()
             
             # Tech Competence & Affinity Keywords
             if any(w in lower_ans for w in ["code", "python", "java", "computer", "software", "app", "web"]):
                 scores["tech_competence"] += 15
                 scores["tech_affinity"] += 10
                 
             # Ambition Keywords
             if any(w in lower_ans for w in ["leader", "business", "company", "ceo", "crore", "rich", "start", "own"]):
                 scores["ambition"] += 15
                 scores["financial_awareness"] += 5
                 
             # Service/Social Keywords
             if any(w in lower_ans for w in ["help", "service", "teach", "doctor", "police", "social"]):
                 scores["ambition"] += 10 # Still ambition, just different direction

        # Option Analysis
        if "options" in q:
            for opt in q["options"]:
                if opt["id"] == ans.selected_option_id:
                    # Update Traits
                    if "traits" in opt:
                        profile["traits"].update(opt["traits"])
                    
                    # --- SCORING RULES ---
                    # Tech Interest
                    if opt["id"] in ["tech", "building", "science", "logic"]: 
                        scores["tech_affinity"] += 20
                        
                    # Arts/Creative
                    if opt["id"] in ["playing", "arts", "design"]: 
                        scores["tech_affinity"] += 5 # Slight overlap
                        scores["clarity"] += 5

                    # Ambition & Finance
                    if opt["id"] == "high": 
                        scores["financial_awareness"] += 25
                        scores["ambition"] += 20
                    if opt["id"] == "mid":
                        scores["financial_awareness"] += 10
                        scores["ambition"] += 10
                    
                    # Confidence (Academic/Mobility)
                    if opt["id"] in ["excellent", "top_tier", "yes"]: scores["confidence"] += 20
                    if opt["id"] in ["average", "mid_tier"]: scores["confidence"] += 10

    # 3. Normalize Scores based on Number of Questions to ensure result consistency
    # Factor logic: Max possible points per question is approx 20-30.
    # We define a "Scaling Factor" to map it to 0-100.
    num_qs = max(len(answers), 1)
    scaling_factor = 2.0 # Adjust based on tuning
    
    # Apply normalization and caps
    final_scores = {}
    for key, val in scores.items():
        # Formula: (Raw / (NumQs * 5)) * 100 ... heuristic
        # We'll stick to a simpler additive cap for robustness with few questions
        # If few questions (3), raw score might be 40. 40 should be ~70%.
        # If many questions (10), raw score might be 150. 150 should be 100%.
        
        normalized = (val / (num_qs * 10)) * 100
        # Boost curve for satisfaction
        boosted = normalized * 1.2 + 20 
        final_scores[key] = int(min(boosted, 98)) # Cap at 98 for realism

    profile["scores"] = final_scores
    
    # Calculate overall readiness (Average of top 3 scores)
    sorted_scores = sorted(final_scores.values(), reverse=True)
    top_3 = sorted_scores[:3]
    profile["overall_score"] = int(sum(top_3) / len(top_3)) if top_3 else 50

    # 3. Construct Narrative Bio for AI Context
    # This was missing, causing generic recommendations.
    bio_parts = []
    bio_parts.append(f"Student ID: {user_id}. Scores: {profile['scores']}.")
    
    # Add text answers explicitly
    for ans in answers:
        q = questions_map.get(ans.question_id)
        if q:
            val = ans.text_answer or ans.selected_option_id
            bio_parts.append(f"{q['text']['en']}: {val}")
            
    profile["full_user_bio_profile"] = "\n".join(bio_parts)

    # Generate AI Bio & Insights (Module 1 Speed Optimized)
    from app.services.gemini_service import generate_career_report
    ai_output = await generate_career_report({"generated_bio": profile})
    
    # Apply AI Trait Adjustments if any
    if "traitAdjustments" in ai_output:
        for trait, adjustment in ai_output["traitAdjustments"].items():
            if trait in profile["scores"]:
                # Apply adjustment with clamp 0-100
                new_score = profile["scores"][trait] + adjustment
                profile["scores"][trait] = max(0, min(100, new_score))

    # Overwrite readiness with AI perception if available and valid
    if "careerReadiness" in ai_output and isinstance(ai_output["careerReadiness"], int):
         profile["overall_score"] = ai_output["careerReadiness"]
    
    # Construct final lightweight result
    result = {
        "status": "complete",
        "generated_bio": {
            "scores": profile["scores"],
            "overall_score": profile["overall_score"],
            "generatedBio": ai_output.get("generatedBio", "Analysis complete."),
            "topRecommendation": ai_output.get("topRecommendation", "Career Path"),
            "keyInsights": ai_output.get("keyInsights", []),
            "raw_answers": profile["raw_answers"] # Keep raw data for Module 2
        }
    }
    
    save_assessment_result(user_id, result)

    # Save to PostgreSQL via Prisma
    if user_id and user_id != "demo_user_123":
        try:
             # Importing here to avoid circular imports if any
            from app.services.user_service import save_assessment_to_profile
            await save_assessment_to_profile(user_id, result)
            print(f"Also saved to PostgreSQL/Prisma for user {user_id}")
        except Exception as e:
            # We don't want to fail the whole request if PG save fails, as Firebase is primary for now
            print(f"Warning: Failed to save to Prisma: {e}")

    return result

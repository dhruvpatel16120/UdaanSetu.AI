import os
import random
import json
import re
from typing import List, Optional
from app.data.question_bank import get_questions
from app.models.schemas import Answer
from app.services.db_firebase import save_assessment_result
import google.generativeai as genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

QUESTION_LIMIT = int(os.getenv("ASSESSMENT_QUESTION_COUNT", 10))

def extract_json(text: str) -> dict:
    """Helper to extract JSON from AI response even if it contains extra text."""
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception as e:
        print(f"JSON extraction failed: {e} | Raw: {text}")
        return {}

def get_session_history_summary(answers: List[Answer]) -> str:
    summary = []
    questions = {q["id"]: q for q in get_questions()}
    for ans in answers:
        q = questions.get(ans.question_id)
        # If question text not found, still provide the answer ID to the AI
        question_text = q['text']['en'] if q else f"Question {ans.question_id}"
        val = ans.text_answer or ans.selected_option_id or "N/A"
        summary.append(f"Q: {question_text} | A: {val}")
    return "\n".join(summary)

async def get_next_dynamic_question(current_answers: List[Answer]) -> Optional[dict]:
    """
    Optimized: Logic-based selection for near-instant transitions.
    """
    all_questions = get_questions()
    asked_ids = [a.question_id for a in current_answers]
    
    if len(current_answers) >= QUESTION_LIMIT:
        return None

    # Pick next question from a pool of unasked questions
    available_qs = [q for q in all_questions if q["id"] not in asked_ids]
    
    if not available_qs:
        return None

    # Logic-based "Dynamic" selection:
    # 1. First question is from a start pool
    if not current_answers:
        start_pool = ["q1_edu_level", "q3_family_type", "q5_interest", "q7_mindset_games"]
        choice = random.choice([qid for qid in start_pool if qid in [q['id'] for q in available_qs]])
        return next((q for q in all_questions if q["id"] == choice), all_questions[0])

    # 2. Prefer questions from sections not yet asked to ensure a broad profile
    asked_sections = set()
    for ans in current_answers:
        q = next((q for q in all_questions if q["id"] == ans.question_id), None)
        if q: asked_sections.add(q.get("section"))

    new_section_qs = [q for q in available_qs if q.get("section") not in asked_sections]
    
    if new_section_qs:
        # Sort of "dynamic" by randomness within new sections
        return random.choice(new_section_qs)
    
    # Fallback to any available question
    return random.choice(available_qs)

async def process_assessment_submission(answers: List[Answer], user_id: str):
    """
    Submodule 1: AI Analysis (The Engine)
    Uses the "Magic Formula" prompt to generate precise SWOT & Career Mindset results.
    """
    all_qs = get_questions()
    qs_map = {q["id"]: q for q in all_qs}
    
    # 1. Synthesis of Raw Data & Traits
    history_str = get_session_history_summary(answers)
    extracted_traits = []
    
    basic_info = {"name": "User", "education": "N/A", "location": "Gujarat"}
    
    for ans in answers:
        q = qs_map.get(ans.question_id)
        if not q: continue
        
        # Meta-data extraction
        if q["id"] == "q1_edu_level" or q["id"] == "static_education": basic_info["education"] = ans.selected_option_id
        if q["id"] == "q13_shifting" or q["id"] == "static_district": basic_info["location"] = ans.selected_option_id
        if ("name" in q["id"].lower() or q["id"] == "static_name") and ans.text_answer: basic_info["name"] = ans.text_answer
        
        # Trait extraction from options
        if "options" in q:
            opt = next((o for o in q["options"] if o["id"] == ans.selected_option_id), None)
            if opt and "traits" in opt:
                extracted_traits.append(opt["traits"])

    # 2. The "Magic Formula" Gemini Stage
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        magic_prompt = f"""
        IDENTITY: Advanced AI Career Architect & Behavioral Psychologist.
        
        QUESTION_BANK_CONTEXT: {json.dumps([{ 'id': q['id'], 'section': q['section'], 'text': q['text']['en'], 'options': [{ 'id': o['id'], 'text': o['text']['en'] } for o in q.get('options', [])] } for q in all_qs])}
        
        USER_ANSWERS: {history_str}
        RAW_TRAITS_DETECTED: {json.dumps(extracted_traits)}
        
        TASK: Perform a high-precision SWOT analysis, bio generation, and mindset extraction for this student. Use the QUESTION_BANK_CONTEXT to understand why they chose specific answers.
        
        OUTPUT DATA POINTS:
        1. Readiness Score (%): Overall readiness for the modern job market.
        2. Trait Scores (0-100): Tech Competence, Ambition, Tech Affinity, Financial Awareness, Confidence, Clarity.
        3. Snapshot: 
           - Top Recommendation: A single, high-confidence career path title (e.g. "Cloud Architect").
           - Key Insights: 3-4 deep behavioral insights based on answers.
        4. Generated Bio: A detailed text summary of the user (e.g., "Rahul is a 12th-grade student from Rajkot with high financial awareness..."). Start with the user's name if known. Use the provided context to make it personal.
        
        TARGET JSON STRUCTURE:
        {{
            "analysis_metadata": {{
                "psyche_profile": "Extracted personality type"
            }},
            "readiness_score": 0-100,
            "trait_scores": {{
                "Tech Competence": 0-100,
                "Ambition": 0-100,
                "Tech Affinity": 0-100,
                "Financial Awareness": 0-100,
                "Confidence": 0-100,
                "Clarity": 0-100
            }},
            "snapshot": {{
                "top_recommendation": "Career Title",
                "key_insights": ["Insight 1", "Insight 2", "Insight 3"]
            }},
            "generated_bio": "Detailed narrative bio..."
        }}
        Only return raw JSON. No conversational text.
        """
        
        # Optional: Print length of prompt to monitor token usage
        # print(f"Prompt length: {len(magic_prompt)} chars")
        
        print(f"Deep analyzing assessment for {user_id}...")
        response = await model.generate_content_async(magic_prompt)
        analysis = extract_json(response.text)
        
        if not analysis: raise ValueError("AI failed to generate valid analysis.")

        assessment_result = {
            "status": "complete",
            "generated_bio": {
                "basic_info": basic_info,
                "readiness_score": analysis.get("readiness_score", 60),
                "trait_scores": analysis.get("trait_scores", {}),
                "snapshot": analysis.get("snapshot", {}),
                "psyche": analysis.get("analysis_metadata", {}).get("psyche_profile", "Determined"),
                "bio_text": analysis.get("generated_bio", "")
            },
            "raw_answers": [a.dict() for a in answers]
        }
        
        save_assessment_result(user_id, assessment_result)
        
        # Also sync basic info to the public profile for easy access
        from app.services.db_firebase import save_user_profile
        public_profile_update = {
            "name": basic_info.get("name"),
            "location": basic_info.get("location"),
            "education": basic_info.get("education")
        }
        save_user_profile(user_id, public_profile_update)
        
        return assessment_result
        
    except Exception as e:
        print(f"Final analysis error: {e}")
        # Robust Fallback
        fallback = {
            "status": "complete",
            "generated_bio": {
                "basic_info": basic_info,
                "readiness_score": 50,
                "trait_scores": {
                    "Tech Competence": 50, "Ambition": 50, "Tech Affinity": 50,
                    "Financial Awareness": 50, "Confidence": 50, "Clarity": 50
                },
                "snapshot": {
                    "top_recommendation": "Career Explorer",
                    "key_insights": ["Strong potential detected", "Continue learning"]
                },
                "bio_text": f"{basic_info.get('name', 'User')} is an ambitious explorer starting their career journey."
            },
            "raw_answers": [a.dict() for a in answers]
        }
        save_assessment_result(user_id, fallback)
        return fallback

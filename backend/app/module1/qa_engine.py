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
        if not q:
            summary.append(f"Q: Question {ans.question_id} | A: {ans.text_answer or ans.selected_option_id}")
            continue
            
        question_text = q['text']['en']
        
        # Resolve Answer
        answer_text = "N/A"
        answer_traits = ""
        
        if ans.text_answer:
            answer_text = ans.text_answer
        elif ans.selected_option_id and "options" in q:
            # Find the option object
            opt = next((o for o in q["options"] if o["id"] == ans.selected_option_id), None)
            if opt:
                answer_text = opt["text"]["en"]
                if "traits" in opt:
                    # Provide trait hints to the LLM (e.g. "Risk: High")
                    answer_traits = f" (Implies: {json.dumps(opt['traits'])})"
            else:
                answer_text = ans.selected_option_id # Fallback if ID matches nothing (rare)
        
        summary.append(f"Question: {question_text}\nUser Answer: {answer_text}{answer_traits}\n")
        
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
    Uses a highly token-efficient prompt to act as a Psychologist & Career Expert.
    Generates full profile, bio, and career roadmap in one shot.
    """
    all_qs = get_questions()
    qs_map = {q["id"]: q for q in all_qs}
    
    # 1. Synthesis of Raw Data
    history_str = get_session_history_summary(answers)
    
    # Extract basic info explicitly if available in answers
    basic_info = {
        "name": "User", 
        "location": "Gujarat", 
        "education": "N/A",
        "age": "N/A",
        "gender": "N/A"
    }
    
    for ans in answers:
        q_id = ans.question_id.lower()
        val = ans.text_answer or ans.selected_option_id
        
        if "name" in q_id: basic_info["name"] = val
        if "education" in q_id or "edu_level" in q_id: basic_info["education"] = val # Will be overridden by option text ID if not careful, but usually education question is multiple choice so val is ID. LLM sees full text in history.
        if "location" in q_id or "district" in q_id or "city" in q_id: basic_info["location"] = val
        if "age" in q_id: basic_info["age"] = val
        if "gender" in q_id: basic_info["gender"] = val
        
        # If specific questions map to basic info, also update from the 'rich' lookup
        # (Optional: we rely on LLM to clean this up in the output 'basic_info' block)

    # 2. Token-Efficient "Psychologist" Prompt
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        # Minimized context to save tokens while retaining persona power
        params = {
            "role": "Professional Psychologist, SWOT Specialist, Career Guiding Expert",
            "task": "Analyze assessment answers. Generate JSON profile.",
            "output_reqs": [
                "Basic Info (refine from input)",
                "3 Suggested Career Paths (Title + Desc)",
                "Readiness Score (0-100)",
                "Trait Scores (Tech Competence, Ambition, Tech Affinity, Financial Awareness, Confidence, Clarity)",
                "Top Recommended Skills",
                "User Current Skills (inferred)",
                "Key Insights (SWOT style)",
                "Professional Bio (3rd person)"
            ]
        }

        magic_prompt = f"""
        ACT AS: {params['role']}
        TASK: {params['task']}
        
        INPUT CONTEXT:
        User Answers (Psychological Data):
        {history_str}
        
        Form Data (Basic Info):
        {json.dumps(basic_info)}
        
        INSTRUCTIONS:
        1. **Analyze Mindset**: Look at the "Implies" traits and user choices. is the user risk-averse? Ambitious? Creative? Tech-savvy?
        2. **Refine Basic Info**: If the user answered "High School" in the education question, update the Basic Info accordingly.
        3. **Career Mapping**: Suggest careers that match their *proven* interests and aptitude, not just what they say they like.
        4. **Bio Generation**: Write a bio that sounds like a professional counselor wrote it. "Rahul is a creative thinker who..."
        
        OUTPUT FORMAT (JSON ONLY):
        {{
          "basic_info": {{ "name": "...", "location": "...", "education": "...", "age": "...", "gender": "..." }},
          "career_paths": [
            {{ "title": "...", "description": "..." }},
            {{ "title": "...", "description": "..." }},
            {{ "title": "...", "description": "..." }}
          ],
          "readiness_score": <int 0-100>,
          "trait_scores": {{
            "Tech Competence": <int 0-100>,
            "Ambition": <int>,
            "Tech Affinity": <int>,
            "Financial Awareness": <int>,
            "Confidence": <int>,
            "Clarity": <int>
          }},
          "top_skills_recommended": ["...", "..."],
          "user_current_skills": ["...", "..."],
          "key_insights": ["...", "..."],
          "bio": "Professional narrative bio..."
        }}
        """
        
        print(f"Deep analyzing assessment for {user_id}...")
        response = await model.generate_content_async(magic_prompt)
        analysis = extract_json(response.text)
        
        if not analysis: raise ValueError("AI failed to generate valid analysis.")

        # Merge AI refined info with defaults if AI missed something (optional, but AI usually does well)
        # We rely on AI's 'basic_info' as appropriate
        
        assessment_result = {
            "status": "complete",
            "analysis": analysis, # Store the full structured analysis
            "generated_bio": { # Keep backward compatibility structure if needed, or just map new fields
                "bio_text": analysis.get("bio", ""),
                "snapshot": {
                    "top_recommendation": analysis.get("career_paths", [{}])[0].get("title", "Explorer"),
                    "key_insights": analysis.get("key_insights", [])
                },
                "trait_scores": analysis.get("trait_scores", {}),
                "readiness_score": analysis.get("readiness_score", 0)
            },
            "raw_answers": [a.dict() for a in answers]
        }
        
        save_assessment_result(user_id, assessment_result)
        
        # Sync to public profile
        from app.services.db_firebase import save_user_profile
        public_profile_update = {
            "aiBio": analysis.get("bio", ""),
            "traits": analysis.get("trait_scores", {}),
            "basic_info": analysis.get("basic_info", basic_info),
            "top_careers": analysis.get("career_paths", []),
            "skills": {
                "current": analysis.get("user_current_skills", []),
                "recommended": analysis.get("top_skills_recommended", [])
            }
        }
        save_user_profile(user_id, public_profile_update)
        
        return assessment_result
        
    except Exception as e:
        print(f"Final analysis error: {e}")
        # Robust Fallback
        return {
            "status": "error",
            "error": str(e),
            "raw_answers": [a.dict() for a in answers]
        }

from typing import List
from app.data.question_bank import get_questions
from app.models.schemas import Answer
from app.services.db_firebase import save_assessment_result

def get_next_question_id(question_id: str, selected_option_id: str = None) -> str:
    """
    Determine the next question ID based on branching logic.
    """
    questions = get_questions()
    questions_map = {q["id"]: q for q in questions}
    
    current_q = questions_map.get(question_id)
    if not current_q:
        return None
        
    # 1. Check if the selected option has a specific branch
    if selected_option_id and "options" in current_q:
        for opt in current_q["options"]:
            if opt["id"] == selected_option_id and opt.get("next_question_id"):
                return opt["next_question_id"]
                
    # 2. Check if the question has a default next_question_id
    if current_q.get("next_question_id"):
        return current_q["next_question_id"]
        
    # 3. Default: Find the next question in the sequence
    all_ids = [q["id"] for q in questions]
    try:
        current_index = all_ids.index(question_id)
        if current_index + 1 < len(all_ids):
            return all_ids[current_index + 1]
    except ValueError:
        pass
        
    return None

def generate_user_bio_profile(profile_data: dict) -> str:
    """
    Generate a comprehensive, narrative-style bio of the user based on assessment data.
    This serves as the 'User Context' for the LLM to generate personalized advice.
    """
    # 1. Basic Demographics & Education
    name = profile_data.get("name", "The student")
    edu = profile_data.get("education", "unknown education level")
    loc = profile_data.get("location", "Gujarat")
    gender = profile_data.get("gender", "unknown gender")
    
    # 2. Traits & Background
    traits = profile_data.get("traits", {})
    family_bg = traits.get("family_background", "unknown")
    fin_status = traits.get("financial_status", "unknown")
    academic = traits.get("academic_performance", "average")
    
    # 3. Interests & Goals
    text_res = profile_data.get("text_responses", {})
    hobbies = text_res.get("q6_hobbies", "Not specified")
    vision = text_res.get("q9_vision", "Not specified")
    strengths = text_res.get("q11_positive", "Not specified")
    weaknesses = text_res.get("q12_negative", "Not specified")
    
    # Construct Narrative
    bio_sections = []
    
    # Section A: Identity
    bio_sections.append(f"Student Profile: {name}, a {gender} from {loc}.")
    bio_sections.append(f"Current Status: Studying at {edu} level with {academic} academic performance.")
    
    # Section B: Socio-Economic Context
    family_desc = f"comes from a {family_bg}-oriented family" if family_bg != 'unknown' else "has an undisclosed family background"
    fin_desc = f"with {fin_status} financial resources" if fin_status != 'unknown' else ""
    bio_sections.append(f"Background: {name} {family_desc} {fin_desc}.")
    
    # Section C: Psychographics & Interests
    interest = traits.get("interest_domain", "general fields")
    mindset = traits.get("tech_mindset", "general")
    bio_sections.append(f"Interests: Primary interest lies in {interest}. Tech Mindset: {mindset}.")
    bio_sections.append(f"Hobbies & Activities: {hobbies}.")
    
    # Section D: Aspirations & Self-Reflection
    bio_sections.append(f"Career Vision: \"{vision}\"")
    bio_sections.append(f"Self-Perceived Strengths: {strengths}")
    bio_sections.append(f"Self-Perceived Areas for Improvement: {weaknesses}")
    
    # Section E: Constraints
    mobility = profile_data.get("mobility", "maybe")
    mobility_desc = "willing to relocate anywhere" if mobility == "yes" else ("prefers within Gujarat" if mobility == "partial" else "restricted to current location")
    bio_sections.append(f"Logistics: Income Assumption: {traits.get('income_expectation', 'market standard')}. Mobility: {mobility_desc}.")

    return "\n".join(bio_sections)

async def process_assessment_submission(answers: List[Answer], user_id: str = "demo_user_123"):
    """
    Business Logic for processing assessment and generating the Bio Profile.
    """
    questions_map = {q["id"]: q for q in get_questions()}
    
    # Initialize profile data
    profile = {
        "name": "Unknown",
        "gender": "Unknown",
        "dob": "Unknown",
        "location": "Unknown",
        "education": "Unknown",
        "mobility": "maybe",
        "traits": {},
        "text_responses": {},
        "scores": {
            "tech_affinity": 0,
            "ambition": 0,
            "financial_awareness": 0
        }
    }
    
    for ans in answers:
        q = questions_map.get(ans.question_id)
        if not q:
            continue
            
        # Capture Basic Info
        if ans.question_id == "static_name":
            profile["name"] = ans.text_answer
        elif ans.question_id == "static_gender":
            profile["gender"] = ans.selected_option_id
        elif ans.question_id == "static_dob":
            profile["dob"] = ans.text_answer
        elif ans.question_id == "static_district":
            profile["location"] = ans.selected_option_id
        elif ans.question_id == "q1_edu_level" and ans.selected_option_id:
             for opt in q.get("options", []):
                if opt["id"] == ans.selected_option_id:
                     profile["education"] = opt["text"]["en"]
        elif ans.question_id == "q13_shifting":
            profile["mobility"] = ans.selected_option_id

        # Capture Traits and update scores
        if ans.selected_option_id and "options" in q:
            for opt in q["options"]:
                if opt["id"] == ans.selected_option_id:
                    if "traits" in opt:
                        for trait, value in opt["traits"].items():
                            profile["traits"][trait] = value
                            
                            # Simple Scoring Logic
                            if trait == "tech_mindset" and value == "creator":
                                profile["scores"]["tech_affinity"] += 40
                            if trait == "interest_domain" and value == "tech":
                                profile["scores"]["tech_affinity"] += 30
                            if trait == "income_expectation" and value == "high":
                                profile["scores"]["ambition"] += 50

        # Capture Text Responses
        if q["type"] == "text" and ans.text_answer:
            profile["text_responses"][ans.question_id] = ans.text_answer

    # 1. Generate Full Bio Profile String
    full_bio_profile = generate_user_bio_profile(profile)
    profile["full_user_bio_profile"] = full_bio_profile

    # --- AI INTEGRATION START ---
    from app.services.gemini_service import generate_career_report
    
    # Send enriched profile to Gemini for the Career Report
    print(f"Generating AI Career Report for {profile['name']}...")
    ai_report = await generate_career_report({"generated_bio": profile})
    
    student_profile = {
        "status": "complete",
        "generated_bio": {
            **profile,
            "ai_report": ai_report
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

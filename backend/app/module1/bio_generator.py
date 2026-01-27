import os
import json
from firebase_admin import firestore
from app.services.db_firebase import get_assessment_result, save_user_profile
import google.generativeai as genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

async def generate_user_bio_profile(user_id: str):
    """
    Submodule 2: Bio-Profile Generator (The Storyteller)
    Uses the "Magic Formula" to convert technical assessment metrics into 
    a rich, narrative user profile for the Dashboard.
    """
    try:
        # 1. Retrieve Assessment Result
        assessment = get_assessment_result(user_id)
        if not assessment:
            return {"error": "No assessment found. Please complete the test first."}
            
        # 2. Check if Bio already generated during assessment
        bio_already_exists = assessment.get('generated_bio', {}).get('bio_text')
        
        if bio_already_exists:
            print(f"Using pre-generated bio for {user_id}")
            profile_ai = {
                "bio": bio_already_exists,
                "topStrengths": assessment.get('generated_bio', {}).get('snapshot', {}).get('key_insights', []),
                "recommendation": assessment.get('generated_bio', {}).get('snapshot', {}).get('top_recommendation')
            }
        else:
            # Call Gemini for Narrative Bio & Social Proof (Fallback)
            model = genai.GenerativeModel("gemini-2.0-flash")
            # ... existing magic formula logic ...
            # For simplicity, I'll keep the existing LLM logic as fallback but wrap it
            magic_formula = f"""
            ROLE: Expert Career Storyteller & Motivational Profiler.
            INPUT_DATA: 
            - Traits: {json.dumps(assessment.get('trait_scores', {}))}
            - Recommendation: {assessment.get('snapshot', {}).get('top_recommendation')}
            - Insights: {json.dumps(assessment.get('snapshot', {}).get('key_insights', []))}
            
            TASK: Generate a high-impact narrative bio and structured strengths for the user's dashboard.
            
            OUTPUT JSON:
            {{
                "bio": "3-5 impactful sentences starting with user's name...",
                "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
                "recommendation": "Main Recommendation"
            }}
            Return ONLY valid JSON.
            """
            response = await model.generate_content_async(magic_formula)
            from app.module1.qa_engine import extract_json
            profile_ai = extract_json(response.text)
            
            if not profile_ai:
                raise ValueError("AI failed to generate profile narrative.")
            
        # 3. Store in 'users' collection (The Public Profile)
        # We save as 'aiBio' to match user_service.py expected key
        user_doc_update = {
            "aiBio": profile_ai.get("bio", ""),
            "traits": assessment.get('trait_scores', {}),
            "ai_report": profile_ai,
            "last_updated": firestore.SERVER_TIMESTAMP
        }
        
        save_user_profile(user_id, user_doc_update)
        return user_doc_update
        
    except Exception as e:
        print(f"Bio generation failed: {e}")
        return {"error": f"Failed to generate bio: {str(e)}"}

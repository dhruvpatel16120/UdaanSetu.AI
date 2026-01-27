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
    Submodule 2: Bio-Profile Generator (The Fetcher)
    Since Module 1 (AQ Engine) now handles the full AI generation, this module 
    simply organizes and returns that data for the profile page.
    """
    try:
        # 1. Retrieve Assessment Result
        assessment = get_assessment_result(user_id)
        if not assessment or not assessment.get('analysis'):
            # If no analysis exists, we can't do much without the AI step which is now in Module 1.
            # However, we can check if 'generated_bio' exists from legacy/fallback
            if assessment and assessment.get('generated_bio'):
                 return {
                    "source": "legacy",
                    "bio": assessment.get('generated_bio', {}).get('bio_text'),
                    "snapshot": assessment.get('generated_bio', {}).get('snapshot')
                 }
            return {"error": "No assessment or AI profile found. Please complete the assessment."}
            
        # 2. Extract Data from Module 1 Output
        analysis = assessment.get('analysis', {})
        
        # 3. Construct Profile Object
        profile_data = {
            "basic_info": analysis.get("basic_info"),
            "bio": analysis.get("bio"),
            "stats": {
                "readiness": analysis.get("readiness_score"),
                "traits": analysis.get("trait_scores")
            },
            "careers": analysis.get("career_paths"),
            "skills": {
                "top_recommended": analysis.get("top_skills_recommended"),
                "current": analysis.get("user_current_skills")
            },
            "insights": analysis.get("key_insights")
        }
        
        # 4. Ensure it's synced to 'users' collection (double check)
        from app.services.db_firebase import save_user_profile
        user_doc_update = {
            "aiBio": profile_data["bio"],
            "profile_data": profile_data,
            "last_updated": firestore.SERVER_TIMESTAMP
        }
        save_user_profile(user_id, user_doc_update)
        
        return user_doc_update
        
    except Exception as e:
        print(f"Bio retrieval failed: {e}")
        return {"error": f"Failed to retrieve bio: {str(e)}"}

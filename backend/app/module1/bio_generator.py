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
        
        # 4. Conditional Sync to 'users' collection
        from app.services.db_firebase import save_user_profile, get_user_profile
        
        # Prepare the data payload we WANT to save
        new_payload = {
            "aiBio": profile_data["bio"],
            "profile_data": profile_data
        }
        
        # Check existing data to avoid redundant writes
        current_profile = get_user_profile(user_id)
        should_update = True
        
        if current_profile:
            # Compare relevant fields (ignoring timestamps or other unrelated user fields)
            current_bio = current_profile.get("aiBio")
            current_data = current_profile.get("profile_data")
            
            # If both key fields are identical, we skip the write
            if current_bio == new_payload["aiBio"] and current_data == new_payload["profile_data"]:
                should_update = False
                print(f"Profile for {user_id} is up-to-date. Skipping Firestore write.")

        if should_update:
            # Add timestamp only when acting on the update
            final_update = {**new_payload, "last_updated": firestore.SERVER_TIMESTAMP}
            save_user_profile(user_id, final_update)
            print(f"Synced updated profile for {user_id} to Firestore.")
            return final_update
        
        # Return the data structure even if we didn't write, so frontend gets it
        return new_payload
        
    except Exception as e:
        print(f"Bio retrieval failed: {e}")
        return {"error": f"Failed to retrieve bio: {str(e)}"}

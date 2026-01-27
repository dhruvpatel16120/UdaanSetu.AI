from typing import Optional, Dict, Any
import json
from app.services.db_firebase import get_user_profile, save_user_profile

async def get_user_by_firebase_id(firebase_id: str):
    """
    Fetches user data from Firestore. 
    Returns a dict that mimics the Prisma User + Profile structure.
    """
    print(f"Fetching from Firestore for user: {firebase_id}")
    try:
        data = get_user_profile(firebase_id)
        if not data:
            return None
        
        # Flattened/Mocked structure to satisfy existing router logic
        # We wrap 'profile' related fields into a 'profile' key if they exist
        user_obj = {
            "id": firebase_id,
            "firebaseId": firebase_id,
            "email": data.get("email"),
            "name": data.get("name"),
            "ai_report": data.get("ai_report"),
            "profile": {
                "id": f"prof_{firebase_id}",
                "userId": firebase_id,
                "educationLevel": data.get("educationLevel") or data.get("education"),
                "personalInterests": data.get("personalInterests") or data.get("interests"),
                "careerGoals": data.get("careerGoals") or data.get("goals"),
                "aiBio": data.get("aiBio") or data.get("bio"),
                "traits": data.get("traits"),
                "location": data.get("location") or data.get("district")
            }
        }
        return user_obj
    except Exception as e:
        print(f"Error in get_user_by_firebase_id (Firestore): {e}")
        return None

async def create_or_update_user(firebase_id: str, email: str, name: Optional[str] = None):
    """
    Upserts basic user info to Firestore.
    """
    try:
        user_data = {
            "firebaseId": firebase_id,
            "email": email,
            "name": name,
            "updated_at": "auto" # Firestore can handle timestamps
        }
        save_user_profile(firebase_id, user_data)
        return await get_user_by_firebase_id(firebase_id)
    except Exception as e:
        print(f"Error in create_or_update_user: {e}")
        return None

async def update_user_profile(firebase_id: str, profile_data: Dict[str, Any]):
    """
    Updates user profile data in Firestore.
    """
    try:
        # Save to Firestore (merge=True is handled in save_user_profile)
        save_user_profile(firebase_id, profile_data)
        return await get_user_by_firebase_id(firebase_id)
    except Exception as e:
        print(f"Error in update_user_profile: {e}")
        return None

async def save_assessment_to_profile(firebase_id: str, student_profile: Dict[str, Any]):
    """
    DEPRECATED: Assessment Engine now handles Firestore saving directly.
    We keep this for backward safety but it's now a no-op as assessment_engine.py 
    calls save_assessment_result directly.
    """
    print(f"Postgres/Prisma save requested for {firebase_id} - Ignored (Firestore only)")
    return

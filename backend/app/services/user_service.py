from typing import Optional, Dict, Any
import json
from app.db import get_db
from app.core.exceptions import DatabaseException

async def get_user_by_firebase_id(firebase_id: str):
    print(f"Connecting to DB for user: {firebase_id}")
    db = await get_db()
    try:
        user = await db.user.find_unique(
            where={"firebaseId": firebase_id},
            include={"profile": True}
        )
        print(f"User found: {user is not None}")
        return user
    except Exception as e:
        print(f"Error in get_user_by_firebase_id: {e}")
        raise DatabaseException(message="Failed to retrieve user", details={"error": str(e)})

async def create_or_update_user(firebase_id: str, email: str, name: Optional[str] = None):
    db = await get_db()
    try:
        user = await db.user.upsert(
            where={"firebaseId": firebase_id},
            data={
                "create": {
                    "firebaseId": firebase_id,
                    "email": email,
                    "name": name
                },
                "update": {
                    "name": name,
                    "email": email
                }
            }
        )
        return user
    except Exception as e:
        print(f"Error in create_or_update_user: {e}")
        raise DatabaseException(message="Failed to create or update user", details={"error": str(e)})

async def update_user_profile(user_id: str, profile_data: Dict[str, Any]):
    db = await get_db()
    try:
        # Check if profile exists
        profile = await db.profile.find_unique(where={"userId": user_id})
        
        if profile:
            updated_profile = await db.profile.update(
                where={"userId": user_id},
                data=profile_data
            )
        else:
            updated_profile = await db.profile.create(
                data={
                    "userId": user_id,
                    **profile_data
                }
            )
        return updated_profile
    except Exception as e:
        print(f"Error in update_user_profile: {e}")
        raise DatabaseException(message="Failed to update user profile", details={"error": str(e)})

async def save_assessment_to_profile(user_id: str, student_profile: Dict[str, Any]):
    """
    Saves assessment results and generated bio to the database.
    """
    db = await get_db()
    try:
        # 1. Save Raw Assessment Result
        await db.assessmentresult.create(
            data={
                "userId": user_id,
                "resultData": student_profile
            }
        )

        # 2. Extract bio data
        education = student_profile.get("generated_bio", {}).get("education", "Unknown")
        traits = student_profile.get("generated_bio", {}).get("traits", {})
        ai_report = student_profile.get("generated_bio", {}).get("ai_report", "")

        # 3. Update Profile
        # We use upsert for profile
        await db.profile.upsert(
            where={"userId": user_id},
            data={
                "create": {
                    "userId": user_id,
                    "educationLevel": education,
                    "traits": json.dumps(traits),
                    "aiBio": str(ai_report)
                },
                "update": {
                    "educationLevel": education,
                    "traits": json.dumps(traits),
                    "aiBio": str(ai_report)
                }
            }
        )
    except Exception as e:
        print(f"Error in save_assessment_to_profile: {e}")
        raise DatabaseException(message="Failed to save assessment", details={"error": str(e)})

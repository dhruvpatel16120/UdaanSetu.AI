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
        # Separate 'name' which belongs to User model
        name = profile_data.pop("name", None)
        if name:
            await db.user.update(
                where={"id": user_id},
                data={"name": name}
            )

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

async def save_assessment_to_profile(firebase_id: str, student_profile: Dict[str, Any]):
    """
    Saves assessment results and generated bio to the database.
    Args:
        firebase_id: The Firebase UID of the user.
        student_profile: The assessment data.
    """
    db = await get_db()
    try:
        # 1. Resolve Firebase ID to Internal PostgreSQL UUID
        user = await db.user.find_unique(where={"firebaseId": firebase_id})
        
        if not user:
            print(f"Postgres Save Skipped: User with Firebase ID {firebase_id} not found in Relational DB.")
            return

        internal_id = user.id

        # Sanitize JSON data to ensure compatibility with Prisma Json field
        try:
            safe_result_data = json.loads(json.dumps(student_profile, default=str))
        except Exception as json_error:
            print(f"Warning: JSON serialization failed for assessment result: {json_error}")
            safe_result_data = {"error": "Serialization failed", "raw_summary": str(student_profile)[:500]}

        # 2. Save Raw Assessment Result
        # Use 'connect' for the relation to be explicit and avoid 'value required' errors
        await db.assessmentresult.create(
            data={
                "user": {"connect": {"id": internal_id}},
                "resultData": safe_result_data
            }
        )

        # 3. Extract bio data
        bio_data = student_profile.get("generated_bio", {})
        # Education is not strictly in the new structure, might be in raw_answers or inferable, 
        # but for now we'll default or extract if we add it back. 
        # We can extract it from raw answers if needed, but let's keep it simple.
        education = "Assessed" 

        traits = bio_data.get("scores", {})
        ai_bio_text = bio_data.get("generatedBio", "")
        
        # 4. Update Profile
        await db.profile.upsert(
            where={"userId": internal_id},
            data={
                "create": {
                    "userId": internal_id,
                    "educationLevel": education,
                    "traits": json.dumps(traits),
                    "aiBio": ai_bio_text
                },
                "update": {
                    "educationLevel": education,
                    "traits": json.dumps(traits),
                    "aiBio": ai_bio_text
                }
            }
        )
        print(f"Successfully saved assessment to Postgres for user {firebase_id} (Internal: {internal_id})")
        
    except Exception as e:
        print(f"Error in save_assessment_to_profile: {e}")
        # explicit logging
        import traceback
        traceback.print_exc()
        raise DatabaseException(message="Failed to save assessment", details={"error": str(e)})

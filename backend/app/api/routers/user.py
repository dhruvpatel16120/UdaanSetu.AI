from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.services.user_service import get_user_by_firebase_id, create_or_update_user, update_user_profile
from app.assessment_logic.bio_generator import generate_user_bio_profile
from app.core.security import get_current_user_uid
from pydantic import BaseModel

router = APIRouter()

class UserSyncRequest(BaseModel):
    # firebase_id attribute is no longer needed in body as we trust the token
    email: Optional[str] = None
    name: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    educationLevel: Optional[str] = None
    personalInterests: Optional[str] = None
    careerGoals: Optional[str] = None

@router.post("/sync")
async def sync_user(data: UserSyncRequest, uid: str = Depends(get_current_user_uid)):
    """
    Sync user data from Firebase after login/signup.
    Authenticated via Bearer Token.
    """
    user = await create_or_update_user(uid, data.email, data.name)
    return user

@router.get("/me")
async def get_my_profile(uid: str = Depends(get_current_user_uid)):
    """
    Retrieve the profile of the currently logged-in user.
    """
    user = await get_user_by_firebase_id(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile")
async def update_my_profile(data: ProfileUpdateRequest, uid: str = Depends(get_current_user_uid)):
    """
    Update personal bio information.
    """
    profile = await update_user_profile(uid, data.dict(exclude_unset=True))
    return profile

@router.get("/{target_uid}")
async def get_user_profile_by_id(target_uid: str, current_uid: str = Depends(get_current_user_uid)):
    """
    Get user profile by Firebase UID.
    """
    # Optional: Add logic to allow only admin or self to view? 
    # For now, public profiles are allowed (e.g. mentor viewing student).
    
    user = await get_user_by_firebase_id(target_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Flatten structure for easier frontend consumption
    profile = user.get("profile", {})
    result = {
        "id": user.get("id"),
        "firebaseId": user.get("firebaseId"),
        "email": user.get("email"),
        "name": user.get("name"),
        "educationLevel": profile.get("educationLevel"),
        "bio": profile.get("aiBio"),
        "personalInterests": profile.get("personalInterests"),
        "careerGoals": profile.get("careerGoals"),
        "location": profile.get("location"),
        "traits": profile.get("traits"),
        "ai_report": user.get("ai_report")
    }
    return result

@router.put("/{target_uid}/profile")
async def update_user_profile_by_id(target_uid: str, data: ProfileUpdateRequest, current_uid: str = Depends(get_current_user_uid)):
    """
    Update user profile by Firebase UID.
    Restricted: Users can only update their own profile.
    """
    if target_uid != current_uid:
         raise HTTPException(status_code=403, detail="Not authorized to update this profile")

    try:
        updated_profile = await update_user_profile(target_uid, data.dict(exclude_unset=True))
        return updated_profile
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-bio")
async def generate_bio(uid: str = Depends(get_current_user_uid)):
    """
    Trigger Stage 2: Bio-Profile Generation from assessment results.
    """
    result = await generate_user_bio_profile(uid)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

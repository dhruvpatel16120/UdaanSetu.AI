from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.services.user_service import get_user_by_firebase_id, create_or_update_user, update_user_profile
from app.module1.bio_generator import generate_user_bio_profile
from pydantic import BaseModel

router = APIRouter()

class UserSyncRequest(BaseModel):
    firebase_id: str
    email: str
    name: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    educationLevel: Optional[str] = None
    personalInterests: Optional[str] = None
    careerGoals: Optional[str] = None

@router.post("/sync")
async def sync_user(data: UserSyncRequest):
    """
    Sync user data from Firebase after login/signup.
    """
    user = await create_or_update_user(data.firebase_id, data.email, data.name)
    return user

@router.get("/me")
async def get_my_profile(x_firebase_id: str = Header(...)):
    """
    Retrieve the profile of the currently logged-in user.
    """
    user = await get_user_by_firebase_id(x_firebase_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile")
async def update_my_profile(data: ProfileUpdateRequest, x_firebase_id: str = Header(None)):
    """
    Update personal bio information.
    """
    if not x_firebase_id:
         raise HTTPException(status_code=400, detail="Header X-Firebase-Id not set")
    profile = await update_user_profile(x_firebase_id, data.dict(exclude_unset=True))
    return profile

@router.get("/{uid}")
async def get_user_profile_by_id(uid: str):
    """
    Get user profile by Firebase UID.
    """
    user = await get_user_by_firebase_id(uid)
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

@router.put("/{uid}/profile")
async def update_user_profile_by_id(uid: str, data: ProfileUpdateRequest):
    """
    Update user profile by Firebase UID.
    """
    # data.dict(exclude_unset=True) ensures we only update fields provided in the request
    try:
        updated_profile = await update_user_profile(uid, data.dict(exclude_unset=True))
        return updated_profile
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-bio")
async def generate_bio(x_firebase_id: str = Header(...)):
    """
    Trigger Stage 2: Bio-Profile Generation from assessment results.
    """
    result = await generate_user_bio_profile(x_firebase_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

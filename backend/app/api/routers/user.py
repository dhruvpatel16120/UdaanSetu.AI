from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.services.user_service import get_user_by_firebase_id, create_or_update_user, update_user_profile
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
    user = await get_user_by_firebase_id(x_firebase_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await update_user_profile(user.id, data.dict(exclude_unset=True))
    return profile

@router.get("/{uid}")
async def get_user_profile_by_id(uid: str):
    """
    Get user profile by Firebase UID.
    """
    user = await get_user_by_firebase_id(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Flatten structure for easier frontend consumption if needed
    result = {
        "id": user.id,
        "firebaseId": user.firebaseId,
        "email": user.email,
        "name": user.name,
        "educationLevel": user.profile.educationLevel if user.profile else None,
        "bio": user.profile.aiBio if user.profile else None,
        "personalInterests": user.profile.personalInterests if user.profile else None,
        "careerGoals": user.profile.careerGoals if user.profile else None,
    }
    return result

@router.put("/{uid}/profile")
async def update_user_profile_by_id(uid: str, data: ProfileUpdateRequest):
    """
    Update user profile by Firebase UID.
    """
    # 1. Get internal User ID from Firebase UID
    user = await get_user_by_firebase_id(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Update Profile using internal User ID
    # data.dict(exclude_unset=True) ensures we only update fields provided in the request
    try:
        updated_profile = await update_user_profile(user.id, data.dict(exclude_unset=True))
        return updated_profile
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

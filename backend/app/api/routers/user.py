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
    educationLevel: Optional[str] = None
    personalInterests: Optional[str] = None
    careerGoals: Optional[str] = None

@router.post("/sync")
async def sync_user(data: UserSyncRequest):
    """
    Sync user data from Firebase after login/signup.
    """
    try:
        user = await create_or_update_user(data.firebase_id, data.email, data.name)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
async def update_my_profile(data: ProfileUpdateRequest, x_firebase_id: str = Header(...)):
    """
    Update personal bio information.
    """
    user = await get_user_by_firebase_id(x_firebase_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        profile = await update_user_profile(user.id, data.dict(exclude_unset=True))
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

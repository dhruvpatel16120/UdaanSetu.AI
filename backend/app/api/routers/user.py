from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from app.services.user_service import get_user_by_firebase_id, create_or_update_user, update_user_profile
from app.core.security import get_current_user_uid
from pydantic import BaseModel

router = APIRouter()

class UserSyncRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None
    interests: Optional[str] = None
    goals: Optional[str] = None
    location: Optional[str] = None

@router.post("/sync")
async def sync_user(data: UserSyncRequest, uid: str = Depends(get_current_user_uid)):
    """Sync user data from Firebase after login/signup."""
    user = await create_or_update_user(uid, data.email, data.name)
    return user

@router.get("/me")
async def get_my_profile(uid: str = Depends(get_current_user_uid)):
    """Retrieve the profile of the currently logged-in user."""
    user = await get_user_by_firebase_id(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile")
async def update_my_profile(data: ProfileUpdateRequest, uid: str = Depends(get_current_user_uid)):
    """Update personal profile information."""
    profile = await update_user_profile(uid, data.dict(exclude_unset=True))
    return profile

@router.get("/{target_uid}")
async def get_user_profile_by_id(target_uid: str, current_uid: str = Depends(get_current_user_uid)):
    """Get any user profile by Firebase UID (for mentor viewing)."""
    user = await get_user_by_firebase_id(target_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional, Dict
from app.services.career_advisor import career_advisor
from app.services.db_firebase import get_user_profile, save_user_profile

router = APIRouter()

@router.post("/generate")
async def generate_career_report(
    payload: Dict = Body(default={}),
    x_firebase_id: Optional[str] = Header(None)
):
    """Generates a detailed Career Roadmap & Gap Analysis (Pillar 3)."""
    uid = x_firebase_id or "anonymous"
    query = payload.get("career_goal", "Software Engineering")
    
    # 1. Get current user profile for context
    user_data = await get_user_profile(uid) or {}
    
    # 2. Generate Report via Advisor (Web Search + AI)
    report = await career_advisor.generate_full_report(uid, query, user_data)
    
    if "error" in report:
        raise HTTPException(status_code=500, detail=report["error"])
        
    # 3. Save to Dedicated Collection
    from app.services.db_firebase import save_career_report
    await save_career_report(uid, report)
    
    return report

@router.get("/report")
async def get_latest_report(x_firebase_id: Optional[str] = Header(None)):
    """Fetches the latest stored career report."""
    uid = x_firebase_id
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    from app.services.db_firebase import get_career_report
    report = await get_career_report(uid)
    
    if not report:
        # Fallback to check if it's in the profile (old architecture)
        user_data = await get_user_profile(uid)
        if user_data and "latest_career_report" in user_data:
            return user_data["latest_career_report"]
        raise HTTPException(status_code=404, detail="No career report found")
        
    return report

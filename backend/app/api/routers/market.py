from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.career_logic.market_analyzer import market_analyzer
from app.services.db_firebase import get_assessment_result

router = APIRouter()

class MarketQuery(BaseModel):
    query: str
    context: Optional[str] = None # Or "user_id"

@router.post("/analyze")
async def analyze_market(request: MarketQuery, x_firebase_id: Optional[str] = Header(None)):
    """
    Get real-time job market intelligence based on user context and query.
    """
    user_id = x_firebase_id or "demo_user_123"
    
    # Fetch User Bio Context
    try:
        data = get_assessment_result(user_id)
        if data and "generated_bio" in data:
            # Pass the full structured bio object for better context
            user_profile = data["generated_bio"]
        else:
            user_profile = {"name": "Student", "location": "Gujarat", "education": "Unknown"}
    except:
        user_profile = {"name": "Student", "location": "Gujarat"}

    result = await market_analyzer.generate_market_analysis(
        user_query=request.query,
        user_profile=user_profile
    )
    
    return result

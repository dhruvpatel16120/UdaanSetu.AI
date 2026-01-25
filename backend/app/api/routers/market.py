from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.market_intelligence import market_service
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
            user_bio = data["generated_bio"].get("full_user_bio_profile", "Student")
        else:
            user_bio = "A generic student from Gujarat seeking career advice."
    except:
        user_bio = "A generic student from Gujarat."

    result = await market_service.generate_market_analysis(
        user_query=request.query,
        user_bio=user_bio
    )
    
    return result

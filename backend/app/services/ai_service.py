"""
================================================================================
UdaanSetu.AI - Service Layer: AI Intelligence Provider
================================================================================
File: ai_service.py
Purpose: Centralizes all interactions with Google Gemini for profile synthesis.
         Ensures clean separation of concerns from the Q&A Engine.
================================================================================
"""

import os
import json
import logging
from typing import List, Dict, Any
from google import genai
from app.models.schemas import IntelligenceProfile

# Configure Logging
logger = logging.getLogger("uvicorn.error")

# Initialize Gemini Client
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None

async def generate_profile_synthesis(
    profile: IntelligenceProfile, 
    signals: List[str], 
    history_summary: List[str]
) -> Dict[str, Any]:
    """
    Uses Gemini 1.5 Flash to synthesize a human-like professional bio 
    and extract key SWOT insights based on the assessment data.
    """
    if not client:
        logger.warning("⚠️ Gemini API Key missing. Skipping AI synthesis.")
        return {}

    try:
        prompt = f"""
        Role: Expert Career Psychologist & Mentor for Indian Students.
        Task: Analyze the user's assessment data and generate a professional profile.

        User Data:
        - Traits: {profile.traits.dict()}
        - Path Readiness: {profile.paths.dict()}
        - Significant Signals: {signals}
        - Detected Conflicts: {profile.conflicts}
        - Session History: {history_summary}

        Objectives:
        1. **Professional Bio**: Write a 3-4 sentence summary of the user. Mention their key strengths, current status, and potential. (Bilingual: English & Gujarati)
        2. **SWOT Insights**: deeper psychological analysis. Provide 3 key bullet points. (Bilingual: English & Gujarati)
           - Focus on hidden strengths or specific areas for improvement.
        
        Output Format (Strict JSON):
        {{
            "bio": {{ 
                "en": "Rahul is a determined student...", 
                "gu": "રાહુલ એક નિશ્ચયી વિદ્યાર્થી છે..." 
            }},
            "insights": [
                {{ "en": "Strong analytical mind but avoids risk...", "gu": "મજબૂત વિશ્લેષણાત્મક મન પરંતુ જોખમ ટાળે છે..." }},
                {{ "en": "...", "gu": "..." }},
                {{ "en": "...", "gu": "..." }}
            ]
        }}
        """

        response = await client.aio.models.generate_content(
            model="gemini-1.5-flash",
            config={"response_mime_type": "application/json"},
            contents=prompt
        )

        return json.loads(response.text)

    except Exception as e:
        error_msg = str(e)
        if "Invalid JWT Signature" in error_msg or "RefreshError" in error_msg:
             logger.critical("🚨 GEMINI AUTH ERROR: Invalid Service Account or System Clock Skew. AI Disabled.")
        logger.error(f"❌ AI Synthesis Failed: {error_msg}")
        return {}

import os
import json
import logging
from typing import List, Dict, Any, Optional

# Configure Logging
logger = logging.getLogger("uvicorn.error")

_client = None

def get_gemini_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("❌ Error: GEMINI_API_KEY is missing from environment!")
            return None
        try:
            from google import genai
            _client = genai.Client(api_key=api_key)
            print(f"✅ Gemini Client Initialized successfully.")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini Client: {e}")
            return None
    return _client

async def call_gemini(prompt: str, response_format: str = "json") -> Optional[Dict[str, Any]]:
    """Generic helper for Gemini calls with robust error handling and lazy initialization."""
    client = get_gemini_client()
    if not client:
        return None
    
    try:
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        config = {"response_mime_type": "application/json"} if response_format == "json" else {}
        response = await client.aio.models.generate_content(
            model=model_name,
            config=config,
            contents=prompt
        )
        
        if not response or not response.text:
            print("❌ Error: Gemini returned empty response.")
            return None

        text = response.text.strip()
        
        # Robust JSON cleaning (Gemini occasionally includes backticks even with JSON mime type)
        if response_format == "json":
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            try:
                return json.loads(text)
            except json.JSONDecodeError as je:
                print(f"❌ Error: Failed to parse Gemini JSON: {je}")
                print(f"Full Text: {text[:500]}...")
                return None
        
        return {"text": text}
    except Exception as e:
        print(f"❌ Gemini Call Failed: {e}")
        logger.error(f"❌ Gemini Call Failed: {e}")
        return None

# --- Pillar 1: Assessment Analysis ---
async def analyze_assessment_data(user_answers: List[Dict]) -> Dict[str, Any]:
    """Analyzes Q&A session for SWOT and psychological insights."""
    prompt = f"""
    Role: Expert Career Psychologist.
    Task: Analyze the following student assessment answers and provide a SWOT analysis + key traits.
    
    Data: {json.dumps(user_answers)}
    
    Output JSON Schema:
    {{
        "swot": {{ "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] }},
        "traits": {{ "aptitude": 0-10, "digital_literacy": 0-10, "financial_drive": 0-10, "stability_need": 0-10 }},
        "summary": "English summary...",
        "summary_gu": "Gujarati summary..."
    }}
    """
    return await call_gemini(prompt)

# --- Pillar 2: Bio-Profile Generation ---
async def generate_student_bio(assessment_summary: Dict, basic_info: Dict) -> Dict[str, Any]:
    """Generates a professional bio and profile based on assessment and basic info."""
    prompt = f"""
    Role: Professional Resume Builder & Career Coach.
    Task: Create a professional profile for a student.
    
    Basic Info: {json.dumps(basic_info)}
    Assessment Insights: {json.dumps(assessment_summary)}
    
    Output JSON Schema:
    {{
        "professional_summary": "...",
        "skillset": ["skill1", "skill2"],
        "recommended_fields": ["field1", "field2"],
        "bilingual_intro": {{ "en": "...", "gu": "..." }}
    }}
    """
    return await call_gemini(prompt)

# --- Pillar 3: Career Report Synthesis ---
async def synthesize_career_report(user_context: Dict, search_data: List[Dict]) -> Dict[str, Any]:
    """Combines user profile with web search data to create a roadmap and gap analysis."""
    prompt = f"""
    Role: Senior Career Strategist & AI Advisor.
    Task: Generate a comprehensive Career Report and Step-by-Step Roadmap for a student.
    
    User Context: {json.dumps(user_context)}
    Real-time Market Data: {json.dumps(search_data)}
    
    The output MUST strictly follow this JSON schema to match the frontend UI:
    {{
        "careerReadiness": 0-100,
        "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
        "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
        "recommendations": [
            {{
                "title": "Career Title",
                "match": 0-100,
                "description": "Short summary...",
                "requirements": ["Req 1", "Req 2"]
            }}
        ],
        "currentSkills": [ {{ "name": "Skill", "level": 0-100 }} ],
        "recommendedSkills": [ {{ "name": "Skill", "priority": "high/medium/low" }} ],
        "learningPaths": [
            {{
                "title": "Path Title",
                "duration": "Duration",
                "resources": [ {{ "name": "Resource", "url": "URL" }} ]
            }}
        ],
        "actionPlan": {{
            "shortTerm": ["Goal 1", "Goal 2"],
            "longTerm": ["Goal 1", "Goal 2"]
        }},
        "career_title": "Primary Goal Title",
        "readiness_score": 0-100,
        "market_snapshot": {{
            "demand": "High/Medium/Low",
            "salary": "Range in INR",
            "trend": "Increasing/Stable",
            "reality_check": "Realistic advice for this career in India."
        }},
        "phases": [
            {{
                "phase": 1,
                "title": "Phase Title",
                "duration": "1-3 months",
                "milestones": ["M1", "M2"],
                "skills": [ {{ "name": "Skill", "priority": "high", "time": "X hours" }} ],
                "resources": [ {{ "name": "Resource", "type": "Course/Video", "url": "URL", "lang": "English/Gujarati" }} ]
            }}
        ],
        "scholarships_and_schemes": [ {{ "name": "Scheme Name", "benefit": "Details", "link": "URL" }} ],
        "success_tips": ["Tip 1", "Tip 2"]
    }}
    
    Instructions:
    - Use the search data to provide REAL URLs for resources and scholarships where possible.
    - Tailor the "reality_check" to the Indian context.
    - Ensure "careerReadiness" is a realistic percentage based on user's current skills vs requirements.
    """
    return await call_gemini(prompt)

# --- Pillar 4: AI Mentor (Conversational RAG) ---
async def get_mentor_guidance(query: str, user_context: Dict, knowledge_base_context: str) -> str:
    """Provides personalized mentorship using RAG and user state."""
    prompt = f"""
    Role: "UdaanSetu AI Mentor" - Empathetic, Wise, and Action-Oriented.
    Context: You are helping a student based on their profile and our knowledge base.
    
    User Profile: {json.dumps(user_context)}
    Verified Knowledge: {knowledge_base_context}
    Student Query: "{query}"
    
    Instructions:
    - If the student feels lost, provide hope and a clear next step.
    - Use the knowledge base to cite specific schemes or paths.
    - Be concise but deeply personalized.
    - Answer in the same language as the query (English/Gujarati/Hindi mix is fine).
    """
    res = await call_gemini(prompt, response_format="text")
    return res["text"] if res else "I'm having trouble connecting to my brain. Please try again."

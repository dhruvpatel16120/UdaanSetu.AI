import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# Load env variables
load_dotenv()

# Configure API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# Initialize Model via LangChain
def get_llm(model_name="gemini-2.5-flash"):
    """
    Get LLM instance. Defaults to Flash for speed and intelligence.
    """
    if api_key:
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.3, # Slightly more creative for reports
            max_output_tokens=4096 # Allow longer reports
        )
    return None

async def chat_with_mentor(history: list, student_profile: dict, query: str) -> str:
    """
    Legacy/Fallback Chat Function. 
    (Note: Primary chat logic is in `chat_mentor.py` which supports streaming).
    """
    # ... (Kept simple as fallback)
    llm = get_llm()
    if not llm: return "AI Service Unavailable."
    
    messages = [SystemMessage(content="You are a helpful AI Career Mentor.")]
    messages.append(HumanMessage(content=query))
    try:
        res = await llm.ainvoke(messages)
        return res.content
    except:
        return "I'm having trouble connecting right now."

async def generate_career_report(student_profile: dict) -> dict:
    """
    Generates a personalized, premium career report using Google Gemini.
    """
    llm = get_llm()
    
    if not llm:
        return {
            "error": "AI Service Unavailable (Missing API Key)",
            "career_options": []
        }

    # Construct the prompt
    bio = student_profile.get("generated_bio", {})
    
    # --- 3. SYNTHESIS LAYER: High-Speed Agent Prompt ---
    prompt = f"""
    IDENTITY: Senior Career Strategist (Udaan).
    TASK: Generate a Career Report (JSON) for a Rural Indian Student.
    MODE: SPEED & IMPACT. Keep all text concise (max 2 sentences per field).
    
    PROFILE:
    Bio: {bio.get("full_user_bio_profile", "N/A")}
    Traits: {json.dumps(bio.get("traits", {}))}
    
    OUTPUT JSON STRUCTURE (Strictly follow this):
    {{
        "careerReadiness": 85, 
        "topStrengths": ["Strength1", "Strength2"],
        "recommendations": [
            {{
                "title": "Role Name", 
                "title_gu": "Gujarati Name",
                "match": 90, 
                "description": "Why it fits (Short).", 
                "description_gu": "Gujarati translation.",
                "requirements": ["Req1", "Req2"], 
                "salary_range": "e.g. 15k-25k"
            }}
        ],
        "recommendedSkills": [ {{ "name": "Skill", "priority": "high" }} ],
        "learningPaths": [ {{ "title": "Path Name", "duration": "3m", "resources": [ {{ "name": "Resource", "url": "URL" }} ] }} ]
    }}
    """
    
    try:
        response = await llm.ainvoke(prompt)
        text_response = response.content.replace("```json", "").replace("```", "").strip()
        data = json.loads(text_response)
        return data
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Return Fallback
        return {
            "careerReadiness": 50,
            "topStrengths": ["Resilience", "Adaptability"],
            "recommendations": [
                {
                    "title": "General Career Guidance",
                    "title_gu": "સામાન્ય કારકિર્દી માર્ગદર્શન",
                    "match": 60,
                    "description": "We couldn't generate a specific report right now, but focus on building digital skills.",
                    "description_gu": "ડિજિટલ કૌશલ્યો શીખવા પર ધ્યાન આપો.",
                    "requirements": ["Basic Literacy", "Internet Access"],
                    "salary_range": "Variable"
                }
            ],
            "recommendedSkills": [],
            "learningPaths": []
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Return Fallback (Keep existing fallback)
        return {
            "careerReadiness": 60,
            "topStrengths": ["Determination", "Hard Work"],
            "personalityTraits": ["Realistic", "Practical"],
            "recommendations": [
                {
                    "title": "General Service Role (Fallback)",
                    "title_gu": "સામાન્ય સેવા ભૂમિકા",
                    "match": 50,
                    "description": "AI service is momentarily down, but based on your profile, service roles might be suitable.",
                    "description_gu": "AI સેવા ક્ષણભર માટે બંધ છે...",
                    "requirements": ["Basic Communication"],
                    "salary_range": "Unknown"
                }
            ],
            "currentSkills": [],
            "recommendedSkills": [],
            "learningPaths": [],
            "actionPlan": {"shortTerm": ["Retry later"], "longTerm": []}
        }



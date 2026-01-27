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
    
    # --- 3. SYNTHESIS LAYER: Bio-Profile Generator (Module 1) ---
    prompt = f"""
    IDENTITY: Expert Career Psychologist & Profiler.
    TASK: Analyze the student's inputs to generate a concise "User Bio Profile".
    Strictly Output JSON. No markdown formatting.
    
    INPUT DATA:
    Bio: {bio.get("full_user_bio_profile", "N/A")}
    Raw Traits: {json.dumps(bio.get("traits", {}))}
    
    OUTPUT JSON STRUCTURE:
    {{
        "careerReadiness": 85, // Integer 0-100 based on clarity & confidence
        "generatedBio": "A 3-4 sentence summary of the user's personality, strengths, and background.",
        "topRecommendation": "Role Title (e.g. Data Scientist)",
        "keyInsights": [
            "Insight 1 (Strength)",
            "Insight 2 (Behavior)",
            "Insight 3 (Potential)"
        ],
        "traitAdjustments": {{ // Optional tweaks to scores if detected in text
            "tech_affinity": 5, 
            "ambition": 0
        }}
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
            "careerReadiness": 60,
            "generatedBio": "Could not connect to AI. However, based on your answers, you seem to have patience and good clarity.",
            "topRecommendation": "General Tech/Service Role",
            "keyInsights": [
                "Good Patience detected",
                "Interest in steady growth"
            ],
            "traitAdjustments": {}
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
             "careerReadiness": 50,
             "generatedBio": "System offline.",
             "topRecommendation": "N/A",
             "keyInsights": [],
             "traitAdjustments": {}
        }



import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Configure API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# Initialize Model
# Using 'gemini-pro' for text-only generation
def get_model():
    if api_key:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash')
    return None

async def generate_career_report(student_profile: dict) -> dict:
    """
    Generates a personalized career report using Google Gemini.
    """
    model = get_model()
    
    if not model:
        return {
            "error": "AI Service Unavailable (Missing API Key)",
            "career_options": []
        }

    # Construct the prompt
    bio = student_profile.get("generated_bio", {})
    name = bio.get("name", "Student")
    gender = bio.get("gender", "Unknown")
    location = bio.get("location", "Gujarat")
    education = bio.get("education", "Unknown")
    traits = bio.get("traits", {})
    text_responses = bio.get("text_responses", {})
    
    prompt = f"""
    Act as an expert Career Counselor for rural Indian youth (UdaanSetu.AI).
    Analyze this student profile and suggest the BEST career path.
    
    Student Persona & Bio-Data:
    {bio.get("full_user_bio_profile", "N/A")}
    
    Additional Data Points:
    - Calculated Category Scores: {json.dumps(bio.get("scores", {}))}
    - Raw Psychological Traits: {json.dumps(traits)}
    - Direct Open-ended Responses: {json.dumps(text_responses)}
    
    Task:
    Provide a detailed career guidance report in valid JSON format ONLY. 
    The JSON must have this EXACT structure to match our frontend:
    {{
        "careerReadiness": 85, // Integer 0-100 based on profile completeness/skills
        "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
        "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
        "recommendations": [
            {{
                "title": "Primary Career Option",
                "match": 95,
                "description": "Short description of this role",
                "requirements": ["Req 1", "Req 2", "Req 3"]
            }},
             {{
                "title": "Alternative Career Option",
                "match": 80,
                "description": "Short description",
                "requirements": ["Req A", "Req B"]
            }}
        ],
        "currentSkills": [
             {{ "name": "Skill from profile", "level": 80 }},
             {{ "name": "Another skill", "level": 70 }}
        ],
        "recommendedSkills": [
            {{ "name": "Critical Skill 1", "priority": "high" }},
            {{ "name": "Nice to have Skill", "priority": "medium" }}
        ],
        "learningPaths": [
            {{
                "title": "Path Name",
                "duration": "Duration",
                "resources": [
                    {{ "name": "Resource Name", "url": "https://example.com" }}
                ]
            }}
        ],
        "actionPlan": {{
            "shortTerm": ["Goal 1", "Goal 2"],
            "longTerm": ["Goal 1", "Goal 2"]
        }}
    }}
    
    Do not include markdown backticks (```json). Just the raw JSON string.
    """
    
    try:
        response = await model.generate_content_async(prompt)
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON
        data = json.loads(text_response)
        return data
        
    except Exception as e:
        print(f"Gemini API Error: {e}")

async def chat_with_mentor(history: list, student_profile: dict, query: str) -> str:
    """
    Handles follow-up chat turns.
    """
    model = get_model()
    if not model:
        return "AI Service Unavailable."

    # Construct Context from Profile
    bio = student_profile.get("generated_bio", {})
    report = bio.get("ai_report", {})
    
    context_str = f"""
    You are an AI Mentor for a student.
    Student Context:
    - Profile Summary: {bio.get('full_user_bio_profile', 'N/A')}
    - Education: {bio.get('education', 'Unknown')}
    - Category Scores: {json.dumps(bio.get('scores', {}))}
    - Recommended Career: {report.get('recommendations', [{}])[0].get('title', 'Unknown')}
    
    The student is asking a follow-up question. Answer directly, be encouraging, and use simple language.
    """
    
    # We can use Gemini's chat history feature, but for stateless REST API,
    # we'll just reconstruct the prompt or use a simplified approach for now.
    
    # Simple one-shot prompt with history appended
    full_prompt = context_str + "\n\nChat History:\n"
    for msg in history[-5:]: # Keep last 5 turns context
        role = msg.get("role", "user")
        content = msg.get("content", "")
        full_prompt += f"{role}: {content}\n"
        
    full_prompt += f"user: {query}\nmodel:"
    
    try:
        response = await model.generate_content_async(full_prompt)
        return response.text
    except Exception as e:
        return f"Sorry, I am having trouble thinking right now. ({str(e)})"

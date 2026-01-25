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
    Get LLM instance. Defaults to Flash for speed.
    """
    if api_key:
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.2
        )
    return None

async def chat_with_mentor(history: list, student_profile: dict, query: str) -> str:
    """
    Handles chat turns with optimization for speed.
    - First Turn: Injects comprehensive student bio + career report context.
    - Follow-ups: Injects minimal persona context to save tokens and latency.
    """
    # Try Flash first for speed
    llm = get_llm("gemini-2.5-flash")
    if not llm:
         return "AI Service Unavailable."

    # Data Extraction
    bio = student_profile.get("generated_bio", {})
    name = bio.get("name", "Student")
    edu = bio.get("education", "12th Grade")
    
    # --- Context Optimization Logic ---
    if len(history) > 0:
        # LITE MODE (Follow-up): Just remind AI of the persona.
        # "Job context... not required... llm already have that [in history]"
        context_str = f"""
        Act as a Mentor for {name} ({edu}).
        Keep answers short, encouraging, and direct.
        """
    else:
        # RICH MODE (First Run): Full Context Injection
        report = bio.get("ai_report", {})
        if isinstance(report, str): report = {}
        
        top_career = "General Career"
        if isinstance(report, dict) and "recommendations" in report and len(report["recommendations"]) > 0:
            top_career = report["recommendations"][0].get("title", "General Path")

        context_str = f"""
        You are an AI Mentor for {name}.
        
        Student Profile:
        - Education: {edu}
        - Location: {bio.get('location', 'Gujarat')}
        - Interests: {bio.get('interest_domains', [])}
        - Top Recommended Career: {top_career}
        
        Guidelines:
        - Be friendly and encouraging (mentor-like).
        - Use simple language (English/Gujarati mixed is okay if helpful).
        - Answer the user's question based on their profile.
        """
    
    messages = [SystemMessage(content=context_str)]
    
    # Add history
    for msg in history[-10:]: # Keep last 10 turns max to manage context window
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        else:
            messages.append(AIMessage(content=content))
            
    # Add current query
    messages.append(HumanMessage(content=query))
    
    try:
        response = await llm.ainvoke(messages)
        return response.content
    except Exception as e:
        print(f"Gemini Flash Error: {e}, falling back to Pro...")
        # Fallback to Pro if Flash fails (e.g. region lock)
        try:
            fallback_llm = get_llm("gemini-pro")
            response = await fallback_llm.ainvoke(messages)
            return response.content
        except Exception as e2:
             return f"Sorry, I am having trouble thinking right now. ({str(e2)})"
async def generate_career_report(student_profile: dict) -> dict:
    """
    Generates a personalized career report using Google Gemini via LangChain.
    """
    llm = get_llm()
    
    if not llm:
        return {
            "error": "AI Service Unavailable (Missing API Key)",
            "career_options": []
        }

    # Construct the prompt
    bio = student_profile.get("generated_bio", {})
    
    # --- 1. RAG LAYER A: Live Market Research ---
    from app.services.market_intelligence import market_service
    
    interests = bio.get("interest_domains", [])
    if not interests and "traits" in bio:
            interests = [bio["traits"].get("interest_domain", "General")]
    
    user_query = f"Career opportunities for {', '.join(interests)} with {bio.get('education', '12th')} background"
    
    print(f"Performing Live RAG Web Research for: {user_query}...")
    web_research = await market_service.perform_web_research(user_query)
    
    # --- 2. RAG LAYER B: Vector Knowledge Retrieval ---
    from app.services.vector_store import vector_service
    
    rag_context = ""
    try:
        search_query = user_query
        docs = await vector_service.similarity_search(search_query, k=3)
        if docs:
            rag_context = "\n".join([f"- {d.page_content}" for d in docs])
    except Exception as e:
        print(f"Vector Retrieval Failed: {e}")

    # --- 3. SYNTHESIS LAYER: Construct The Agent Prompt ---
    prompt = f"""
    Act as an Expert AI Career Mentor for UdaanSetu.AI (Rural India Focus).
    
    --- STUDENT PROFILE ---
    Bio: {bio.get("full_user_bio_profile", "N/A")}
    Scores: {json.dumps(bio.get("scores", {}))}
    Traits: {json.dumps(bio.get("traits", {}))}
    
    --- REAL-TIME MARKET INTELLIGENCE (Web Source) ---
    {web_research.get('stats_context', 'No Data')}
    
    --- KNOWLEDGE BASE (Vector Source) ---
    {rag_context}
    
    --- TASK ---
    Generate a personalized, data-driven Career Guidance Report.
    1. PRIORITIZE careers found in the 'KNOWLEDGE BASE' or 'MARKET INTELLIGENCE' that match the student.
    2. BE REALISTIC: If the student has low financial resources, suggest cost-effective paths (e.g., ITI, Diploma, Online Certs) rather than expensive degrees.
    3. LANGUAGE: Provide key text in English, but you must ensure the content is simple and easy to explain.
    
    REQUIRED JSON OUTPUT FORMAT:
    {{
        "careerReadiness": 85, 
        "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
        "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
        "recommendations": [
            {{
                "title": "Primary Career Option",
                "title_gu": "Guajarati Translation",
                "match": 95,
                "description": "Short explanation of why this fits.",
                "description_gu": "Gujarati explanation.",
                "requirements": ["Skill/Degree 1", "Skill/Degree 2"],
                "salary_range": "e.g. 15k-25k INR/month (derived from market data)"
            }},
             {{
                "title": "Alternative Career Option",
                "title_gu": "Guajarati Translation",
                "match": 80,
                "description": "Short explanation.",
                "description_gu": "Gujarati explanation.",
                "requirements": ["Req A", "Req B"],
                "salary_range": "e.g. 10k-20k INR/month"
            }}
        ],
        "currentSkills": [
            {{ "name": "Skill from bio", "level": 70 }},
            {{ "name": "Soft skill", "level": 80 }}
        ],
        "recommendedSkills": [
            {{ "name": "High Priority Skill from Market Data", "priority": "high" }},
            {{ "name": "Useful Skill", "priority": "medium" }}
        ],
        "learningPaths": [
            {{
                "title": "Roadmap Name",
                "duration": "e.g. 6 Months",
                "resources": [
                    {{ "name": "Best Resource from Web Research", "url": "Actual URL if found, else generic name" }}
                ]
            }}
        ],
        "actionPlan": {{
            "shortTerm": ["Immediate step 1", "Immediate step 2"],
            "longTerm": ["Goal 1", "Goal 2"]
        }}
    }}
    
    Return ONLY valid JSON. Do not use markdown blocks.
    """
    
    try:
        response = await llm.ainvoke(prompt)
        text_response = response.content.replace("```json", "").replace("```", "").strip()
        data = json.loads(text_response)
        return data
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



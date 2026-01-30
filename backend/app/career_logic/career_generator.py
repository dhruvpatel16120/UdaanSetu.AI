import google.generativeai as genai
import os
import json
import re
import asyncio
from app.services.rag_engine import get_rag_engine
from app.career_logic.market_analyzer import market_analyzer

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def extract_json(text: str) -> dict:
    """Helper to extract JSON from AI response."""
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception as e:
        print(f"JSON extraction failed in Career Generator: {e} | Raw: {text}")
        return {}

async def generate_career_report(assessment_analysis: dict, basic_info: dict) -> dict:
    """
    Module 2: Career Report Generator (The "Deep Thinker")
    Integrates RAG and Market Intelligence for a comprehensive report.
    """
    try:
        # Use gemini-2.0-flash for deep reasoning (Module 2 Priority: Accuracy)
        model = genai.GenerativeModel("gemini-1.5-pro") # Pro for deeper analysis if available
        
        # 1. Determine Target Path
        target_path = assessment_analysis.get("snapshot", {}).get("top_recommendation", "General Career")
        
        # 2. Parallel Data Retrieval
        rag_engine = get_rag_engine()
        
        # Fetch RAG Context (Scholarships, Govt Schemes, Verified Path)
        rag_task = asyncio.to_thread(rag_engine.get_context_for_query, target_path, {**basic_info, **assessment_analysis})
        
        # Fetch Market Context (Real-time trends)
        market_task = market_analyzer.generate_market_analysis(target_path, {**basic_info, **assessment_analysis})
        
        rag_context, market_context = await asyncio.gather(rag_task, market_task)
        
        # 3. LLM Synthesis
        prompt = f"""
        ROLE: Expert Career Strategic Planner.
        TASK: Synthesize a "Professional Career Report" for a rural student.
        
        INPUT DATA:
        ---
        STUDENT PROFILE:
        {json.dumps(assessment_analysis)}
        ---
        VERIFIED KNOWLEDGE (RAG):
        {rag_context}
        ---
        MARKET INTELLIGENCE:
        {json.dumps(market_context)}
        ---
        
        MISSION:
        Generate a detailed 6-month career roadmap. Focus on local Gujarat opportunities and rural-accessible resources.
        
        REQUIRED JSON STRUCTURE:
        {{
          "career_title": "{target_path}",
          "careerReadiness": <int 0-100>,
          "market_snapshot": {{
            "demand": "High/Medium/Low",
            "salary_range": "e.g. 20,000 - 35,000 INR",
            "trend": "Growth/Stable insights"
          }},
          "topStrengths": ["...", "..."],
          "personalityTraits": ["...", "..."],
          "recommendations": [
            {{ "title": "...", "match": <int>, "description": "...", "requirements": ["..."] }}
          ],
          "currentSkills": [{{ "name": "...", "level": <int> }}],
          "recommendedSkills": [{{ "name": "...", "priority": "high/med" }}],
          "learningPaths": [
            {{
              "title": "Phase 1: Foundations",
              "duration": "1 Month",
              "resources": [
                {{ "name": "Resource Name", "url": "Link", "type": "YouTube/Free Course" }}
              ]
            }}
          ],
          "actionPlan": {{
            "shortTerm": ["Step 1", "Step 2"],
            "longTerm": ["Goal 1", "Goal 2"]
          }},
          "scholarships_and_schemes": [
            {{ "name": "Govt Scheme Name", "benefit": "Brief benefit", "link": "Direct link or keyword" }}
          ]
        }}
        """
        
        print(f"Synthesizing Career Report for {target_path}...")
        response = await model.generate_content_async(prompt)
        report = extract_json(response.text)
        
        if not report:
             raise ValueError("Failed to synthesize report JSON.")
             
        return report

    except Exception as e:
        print(f"Module 2 Error: {e}")
        # Robust fallback using Market Context if full synthesis fails
        return {
            "careerReadiness": 50,
            "error": str(e),
            "recommendations": market_context.get("recommendations", []) if 'market_context' in locals() else []
        }

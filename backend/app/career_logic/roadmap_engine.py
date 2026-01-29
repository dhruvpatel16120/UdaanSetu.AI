"""
Career Roadmap Generator Engine [Module 2]
Generates personalized, high-precision career blueprints using RAG and Market Analysis.
"""

import os
import json
from typing import Dict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from app.services.rag_engine import get_rag_engine
from app.career_logic.market_analyzer import market_analyzer

load_dotenv()

class CareerRoadmapEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY not found")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key,
            temperature=0.3
        )
    
    async def generate_roadmap(self, career_path: str, student_bio: dict, language: str = "en") -> dict:
        """
        Generate a detailed Professional Blueprint.
        """
        education = student_bio.get("education", "12th")
        location = student_bio.get("location", "Gujarat")
        
        # Define language-specific instructions
        lang_note = ""
        if language == "gu":
            lang_note = """
            IMPORTANT: Provide all descriptions in GUJARATI (ગુજરાતી).
            Keep technical terms in English but explain in Gujarati.
            Example: "HTML (એચટીએમએલ - વેબસાઇટ બનાવવાની ભાષા)"
            """
        else:
            lang_note = "Provide all descriptions in SIMPLE ENGLISH suitable for rural students."
        
        # 1. Fetch RAG Context (Scholarships, Govt Schemes, Verified Path)
        rag_engine = get_rag_engine()
        rag_context = rag_engine.get_context_for_query(career_path, student_bio, k=5)
        
        # 2. Fetch Market Context (Real-time trends)
        market_context = await market_analyzer.generate_market_analysis(career_path, student_bio)
        
        # 3. Construct Prompt with RAG + Market Context
        prompt = f"""
        IDENTITY: Advanced AI Career Architect & Strategic Advisor.
        
        --- INPUT: STUDENT PROFILE ---
        Target Career: {career_path}
        Education: {education}
        Location: {location}
        Behavioral Traits: {json.dumps(student_bio.get("traits", {}))}
        
        --- INPUT: VERIFIED KNOWLEDGE (RAG) ---
        {rag_context}
        
        --- INPUT: MARKET INTELLIGENCE ---
        {json.dumps(market_context)}
        
        --- MISSION ---
        Generate a "Professional Blueprint" for this student. Focus on 6-12 months of growth. 
        Prioritize Rural accessibility, Local Gujarat opportunities, and Government Schemes.
        {lang_note}
        
        --- OUTPUT JSON STRUCTURE ---
        {{
            "career_title": "{career_path}",
            "readiness_score": 0-100,
            "market_snapshot": {{
                "demand": "High/Medium/Stable",
                "salary": "Range in INR",
                "trend": "Explanation of market growth",
                "reality_check": "1-sentence direct advice for a student in {location}"
            }},
            "current_skills_meter": [
                {{ "name": "Skill", "level": 0-100 }}
            ],
            "skills_matrix": {{
                "missing": ["Skill 1", "Skill 2"],
                "emerging": ["Future tool 1"]
            }},
            "phases": [
                {{
                    "phase": 1,
                    "title": "Phase name",
                    "duration": "Duration in weeks/months",
                    "milestones": ["Milestone 1"],
                    "goals": ["Goal 1"],
                    "skills": [{{ "name": "Skill", "priority": "high/med", "time": "2 weeks" }}],
                    "resources": [{{ "name": "Source Name", "type": "YouTube/Gov Portal", "url": "URL/Link", "lang": "EN/GU/HI" }}]
                }}
            ],
            "scholarships_and_schemes": [
                {{ "name": "Scheme/Scholarship", "benefit": "Brief benefit", "link": "Direct link or keyword" }}
            ],
            "action_plan": {{
                "short_term": ["Step 1", "Step 2"],
                "long_term": ["Milestone 1", "Internship goal"]
            }},
            "success_tips": ["Tip 1", "Tip 2"]
        }}
        Return ONLY valid JSON.
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            content = response.content.replace("```json", "").replace("```", "").strip()
            roadmap = json.loads(content)
            return roadmap
        except Exception as e:
            print(f"Roadmap generation error: {e}")
            return {
                "career_title": career_path,
                "error": str(e)
            }
    
    async def get_skill_gap_analysis(self, current_skills: List[str], target_career: str, language: str = "en") -> dict:
        """
        Analyze gap between current skills and target career requirements
        """
        lang_note = "Respond in GUJARATI (ગુજરાતી)" if language == "gu" else "Respond in ENGLISH"
        
        prompt = f"""
        Analyze the skill gap for a rural student.
        Current Skills: {', '.join(current_skills) if current_skills else 'None/Beginner'}
        Target Career: {target_career}
        {lang_note}
        
        Provide a JSON analysis:
        {{
            "missing_skills": [{{ "skill": "Skill Name", "importance": "Critical", "learn_time": "3 weeks", "free_resource": "YouTube" }}],
            "existing_strengths": ["Strength 1"],
            "quick_wins": ["Skill 1"],
            "long_term_skills": ["Skill 2"],
            "overall_readiness": 40
        }}
        Return ONLY JSON.
        """
        try:
            response = await self.llm.ainvoke(prompt)
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            return { "error": str(e) }

# Singleton
roadmap_engine = CareerRoadmapEngine()

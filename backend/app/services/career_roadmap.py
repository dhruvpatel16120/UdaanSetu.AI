"""
Career Roadmap Generator Service
Generates personalized, step-by-step learning roadmaps for rural students
Based on their assessment results and career goals
"""

import os
import json
from typing import Dict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from app.services.rag_engine import get_rag_engine
from app.services.market_intelligence import market_service

load_dotenv()

class CareerRoadmapService:
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
        Generate a detailed 6-month learning roadmap
        
        Args:
            career_path: Target career (e.g., "Software Developer", "Digital Marketing")
            student_bio: Student profile from assessment
            language: "en" or "gu"
        
        Returns:
            JSON roadmap with weekly/monthly milestones
        """
        
        education = student_bio.get("education", "12th")
        location = student_bio.get("location", "Gujarat")
        financial_status = student_bio.get("traits", {}).get("financial_status", "low")
        
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
        market_context = await market_service.generate_market_analysis(career_path, student_bio)
        
        # 3. Construct Prompt with RAG + Market Context
        prompt = f"""
        IDENTITY: Advanced AI Career Architect for Bharat.
        
        --- INPUT: STUDENT PROFILE ---
        Target Career: {career_path}
        Current Education: {education}
        Location: {location}
        Traits: {json.dumps(student_bio.get("traits", {}))}
        
        --- INPUT: VERIFIED KNOWLEDGE (RAG) ---
        {rag_context}
        
        --- INPUT: MARKET INTELLIGENCE ---
        {json.dumps(market_context)}
        
        --- MISSION ---
        Create a 6-month specialized roadmap. Prioritize FREE and GOVERNMENT resources.
        {lang_note}
        
        --- JSON STRUCTURE REQUIREMENTS ---
        {{
            "career_title": "{career_path}",
            "readiness_score": 0-100,
            "market_snapshot": {{
                "demand": "High/Medium",
                "salary": "Range in INR",
                "trend": "Explanation"
            }},
            "phases": [
                {{
                    "phase": 1,
                    "title": "Foundation",
                    "duration": "2 months",
                    "milestones": ["M1", "M2"],
                    "skills": [{{ "name": "Skill", "priority": "high", "time": "2 weeks" }}],
                    "resources": [{{ "name": "Source", "type": "Video/Course", "url": "URL", "lang": "HI/GU/EN" }}]
                }}
            ],
            "scholarships_and_schemes": [
                {{ "name": "Scheme Name", "benefit": "Details", "link": "URL" }}
            ],
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
            # Fallback minimal roadmap
            return {
                "career_title": career_path,
                "total_duration": "6 months",
                "phases": [
                    {
                        "phase_number": 1,
                        "title": "Foundation Phase",
                        "duration": "2 months",
                        "goals": ["Learn basics", "Build foundation"],
                        "skills": [],
                        "resources": [],
                        "projects": [],
                        "milestones": []
                    }
                ],
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
            "missing_skills": [
                {{
                    "skill": "Skill Name",
                    "importance": "Critical/Important/Nice-to-have",
                    "learn_time": "e.g., 3 weeks",
                    "free_resource": "Where to learn for free"
                }}
            ],
            "existing_strengths": ["Strength 1", "Strength 2"],
            "quick_wins": ["Skills you can learn in 1-2 weeks"],
            "long_term_skills": ["Skills that take 2-3 months"],
            "overall_readiness": 40
        }}
        
        Return ONLY JSON.
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            print(f"Skill gap analysis error: {e}")
            return {
                "missing_skills": [],
                "existing_strengths": [],
                "quick_wins": [],
                "long_term_skills": [],
                "overall_readiness": 50,
                "error": str(e)
            }

# Singleton
roadmap_service = CareerRoadmapService()

"""
Career Roadmap Generator Service
Generates personalized, step-by-step learning roadmaps for rural students
Based on their assessment results and career goals
"""

from typing import Dict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

class CareerRoadmapService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY not found")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
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
        
        prompt = f"""
        You are an Expert Career Counselor creating a practical roadmap for a rural Indian student.
        
        --- STUDENT CONTEXT ---
        Target Career: {career_path}
        Current Education: {education}
        Location: {location}
        Financial Status: {financial_status}
        
        --- CONSTRAINTS ---
        1. Student has LIMITED money - prioritize FREE resources
        2. Internet may be slow - prefer text tutorials over heavy videos
        3. No prior experience - start from absolute basics
        4. Must be achievable in 6 MONTHS with 2-3 hours daily study
        
        {lang_note}
        
        --- YOUR TASK ---
        Create a REALISTIC 6-month roadmap with these phases:
        
        Phase 1: Foundation (Month 1-2)
        Phase 2: Intermediate (Month 3-4)
        Phase 3: Advanced (Month 5-6)
        
        For each phase, provide:
        - Skills to learn (ranked by priority)
        - FREE learning resources (YouTube channels, free courses, government programs)
        - Practical mini-projects
        - Milestones to track progress
        
        REQUIRED JSON FORMAT:
        {{
            "career_title": "{career_path}",
            "total_duration": "6 months",
            "phases": [
                {{
                    "phase_number": 1,
                    "title": "Foundation Phase",
                    "duration": "2 months",
                    "goals": ["Goal 1", "Goal 2"],
                    "skills": [
                        {{
                            "name": "Skill Name",
                            "priority": "high/medium/low",
                            "time_needed": "e.g., 2 weeks"
                        }}
                    ],
                    "resources": [
                        {{
                            "title": "Resource Name",
                            "type": "YouTube/Course/Documentation/Book",
                            "cost": "Free",
                            "url": "actual URL if famous, else generic",
                            "language": "Hindi/English/Gujarati"
                        }}
                    ],
                    "projects": [
                        {{
                            "title": "Project Name",
                            "description": "What to build",
                            "difficulty": "Beginner"
                        }}
                    ],
                    "milestones": ["Checkpoint 1", "Checkpoint 2"]
                }}
            ],
            "certification_options": [
                {{
                    "name": "Certification Name",
                    "provider": "Coursera/Google/etc.",
                    "cost": "Free/Paid",
                    "value": "How it helps"
                }}
            ],
            "job_search_strategy": {{
                "platforms": ["Naukri", "Internshala", "LinkedIn"],
                "gujarat_specific": ["Local opportunities in Gujarat"],
                "remote_opportunities": ["Remote job boards"],
                "expected_salary_range": "15k-25k INR (entry-level)"
            }},
            "success_tips": [
                "Tip 1: Stay consistent",
                "Tip 2: Build portfolio",
                "etc."
            ]
        }}
        
        Return ONLY valid JSON. No markdown blocks.
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

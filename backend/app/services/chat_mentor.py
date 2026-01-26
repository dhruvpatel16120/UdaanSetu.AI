from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import os
import json
from dotenv import load_dotenv

load_dotenv()

class MentorChatService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-2.5-flash"
        
    def _get_llm(self):
        if self.api_key:
            return ChatGoogleGenerativeAI(
                model=self.model_name, 
                google_api_key=self.api_key,
                temperature=0.2
            )
        return None

    async def chat_with_mentor(self, history: list, student_profile: dict, query: str, language: str = "en"):
        """
        Streaming Chat Mentor with Context.
        """
        llm = self._get_llm()
        if not llm:
            yield "AI Service Unavailable."
            return

        # Extract basic info
        bio = student_profile.get("generated_bio", {})
        name = bio.get("name", "Student")
        education = bio.get("education", "Unknown")
        location = bio.get("location", "Gujarat")
        
        # Enhanced Language Instructions
        lang_instruction = ""
        if language == "gu":
            lang_instruction = "Respond in GUJARATI (ગુજરાતી). Use simple words. Explain English terms."
        else:
            lang_instruction = "Respond in SIMPLE English. Avoid jargon."
        
        # --- UdaanSetu.AI Platform Context (COMPRESSED) ---
        platform_context = """
        UdaanSetu.AI: AI Career Mentor for Rural Gujarat.
        Mission: Bridge Rural Dreams to Digital Futures.
        Features: Smart Assessment, AI Career Reports, Bilingual (Gu/En), Job Market Data, Free Resources.
        Target: Rural usage, Class 10-12, Dropouts.
        Team: FutureMinds (Dhruv Patel).
        """
        
        # Smart Query Detection
        query_lower = query.lower()
        
        # Platform-related queries
        is_platform_query = any(keyword in query_lower for keyword in [
            'udaansetu', 'ઉડાનસેતુ', 'platform', 'app', 'about', 'what is', 'features', 'team'
        ])
        
        # Skills/Learning queries
        is_skills_query = any(keyword in query_lower for keyword in [
            'skill', 'learn', 'course', 'tutorial', 'certification', 'study'
        ])
        
        # Job market queries
        is_market_query = any(keyword in query_lower for keyword in [
            'salary', 'job', 'demand', 'market', 'future', 'scope'
        ])
        
        # --- Context Strategy ---
        if len(history) > 0:
            # FOLLOW-UP: Minimal Context
            if is_platform_query:
                context_str = f"System: UdaanSetu.AI Bot. {lang_instruction}. Context: {platform_context}."
            elif is_skills_query:
                interests = bio.get("interest_domains", [])
                context_str = f"System: Skill Mentor for {name}. {lang_instruction}. Interests: {interests}. Recommend free resources."
            elif is_market_query:
                 context_str = f"System: Career Advisor for {name} ({location}). {lang_instruction}. discuss job trends/salary briefly."
            else:
                 context_str = f"System: Mentor for {name}. {lang_instruction}. Be encouraging."
        else:
            # FIRST INTERACTION: Targeted Context
            if is_platform_query:
                context_str = f"System: UdaanSetu Bot. {lang_instruction}. {platform_context}. Welcome {name}."
            else:
                # Career Guidance - Focused
                top_rec = "General"
                report = bio.get("ai_report", {})
                if report and "recommendations" in report:
                     top_rec = report["recommendations"][0].get("title", "General")

                context_str = f"""
                Role: AI Mentor for {name} ({location}).
                Context: {lang_instruction}
                Profile: {education}, Top Path: {top_rec}.
                Task: Guide on career/skills. Prioritize FREE resources & Rural context.
                """
        
        # Build Message Chain
        messages = [SystemMessage(content=context_str)]
        
        # Add History (Last 6 turns is usually enough for context)
        for msg in history[-6:]:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            else:
                messages.append(AIMessage(content=msg.get("content", "")))
                
        # Add Current Query
        messages.append(HumanMessage(content=query))
        
        try:
            async for chunk in llm.astream(messages):
                yield chunk.content
        except Exception as e:
            yield f"Error: {str(e)}"

# Singleton
mentor_service = MentorChatService()

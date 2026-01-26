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

    async def chat_with_mentor(self, history: list, student_profile: dict, query: str, language: str = "en") -> str:
        """
        Enhanced Chat Mentor with Advanced Context Intelligence.
        Features:
        - Smart context switching (platform vs career queries)
        - Skills gap analysis
        - Job market trends integration
        - Career roadmap guidance
        - Bilingual optimization (English & Gujarati)
        """
        llm = self._get_llm()
        if not llm:
            error_msg = {
                "en": "AI Service is temporarily unavailable. Please try again later.",
                "gu": "AI સેવા અસ્થાયી રૂપે અનુપલબ્ધ છે. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો."
            }
            return error_msg.get(language, error_msg["en"])

        # Extract basic info
        bio = student_profile.get("generated_bio", {})
        name = bio.get("name", "Student")
        education = bio.get("education", "Unknown")
        location = bio.get("location", "Gujarat")
        
        # Enhanced Language Instructions
        lang_instruction = ""
        if language == "gu":
            lang_instruction = """
            CRITICAL LANGUAGE RULE: 
            - Respond ONLY in GUJARATI script (ગુજરાતી)
            - Use simple, conversational Gujarati that rural students can understand
            - For technical terms in English, provide Gujarati explanation alongside
            - Examples: "Software Developer (સોફ્ટવેર ડેવલપર - કમ્પ્યુટર પ્રોગ્રામ બનાવનાર)"
            - Use respectful, encouraging tone suitable for rural youth
            """
        else:
            lang_instruction = """
            LANGUAGE RULE:
            - Respond in simple, clear ENGLISH
            - Use conversational tone, avoid jargon
            - If technical terms needed, explain them simply
            - Keep sentences short and actionable
            """
        
        # --- UdaanSetu.AI Platform Context ---
        platform_context = """
        --- ABOUT UDAANSETU.AI PLATFORM ---
        UdaanSetu.AI (Udaan = Flight, Setu = Bridge / ઉડાન = ઉડાન, સેતુ = પુલ) is Gujarat's first AI-powered Career Mentor for rural youth.
        
        **Mission**: "Bridging Rural Dreams to Digital Futures" / "ગ્રામીણ સપનાઓને ડિજિટલ ભવિષ્ય સાથે જોડવા"
        
        **Core Features**:
        1. **Smart Assessment (સ્માર્ટ મૂલ્યાંકન)**: 20+ questions that understand your personality, interests, and goals
        2. **AI Career Reports**: Get 3 personalized career paths - Safe Path (Government Jobs), Growth Path (Tech/Corporate), Dream Path (Business/Creative)
        3. **Bilingual Support**: Full Gujarati + English support for rural students
        4. **Market Intelligence**: Real job market data from Gujarat & India
        5. **Free Resources**: YouTube tutorials, government schemes, scholarships, free courses
        6. **24/7 AI Mentor**: Chat anytime for career guidance, skill advice, or motivation
        
        **Perfect For**:
        - Class 10-12 students from rural areas
        - Dropouts seeking alternative career paths
        - Youth from low-income families needing cost-effective guidance
        - Students who don't have access to expensive career counselors
        
        **Team**: FutureMinds - Led by Dhruv Patel (Full Stack + AI Engineer)
        **Made in India 🇮🇳**: For Rural India, With Love ❤️
        """
        
        # Smart Query Detection
        query_lower = query.lower()
        
        # Platform-related queries
        is_platform_query = any(keyword in query_lower for keyword in [
            'udaansetu', 'ઉડાનસેતુ', 'platform', 'app', 'પ્લેટફોર્મ', 'about', 'વિશે',
            'what is', 'શું છે', 'features', 'વિશેષતા', 'team', 'ટીમ', 'who made', 'કોણે બનાવ્યું'
        ])
        
        # Skills/Learning queries
        is_skills_query = any(keyword in query_lower for keyword in [
            'skill', 'learn', 'study', 'course', 'tutorial', 'certification',
            'કુશળતા', 'શીખવું', 'અભ્યાસ', 'કોર્સ', 'ટ્યુટોરિયલ'
        ])
        
        # Job market queries
        is_market_query = any(keyword in query_lower for keyword in [
            'salary', 'job', 'demand', 'career', 'market', 'trend', 'future',
            'પગાર', 'નોકરી', 'માંગ', 'કારકિર્દી', 'બજાર', 'ભવિષ્ય'
        ])
        
        # --- Context Strategy ---
        if len(history) > 0:
            # FOLLOW-UP CONVERSATION: Optimized for speed
            if is_platform_query:
                context_str = f"""
                You are an AI Career Mentor for {name} on UdaanSetu.AI.
                {lang_instruction}
                
                {platform_context}
                
                Task: Answer questions about UdaanSetu.AI platform, features, and team.
                Keep it concise (3-4 sentences) and welcoming.
                """
            elif is_skills_query:
                # Skills-focused context
                interests = bio.get("interest_domains", [])
                context_str = f"""
                You are an AI Career Mentor helping {name} learn new skills.
                {lang_instruction}
                
                Student Context:
                - Education: {education}
                - Interests: {', '.join(interests) if interests else 'General'}
                - Location: {location}
                
                Task: Recommend SPECIFIC skills, courses, and FREE resources.
                - Prioritize FREE resources (YouTube, Coursera free courses, government programs)
                - Give step-by-step roadmap (Week 1, Week 2, etc.)
                - Include Hindi/Gujarati resources if available
                
                Keep responses practical and actionable (3-5 sentences).
                """
            elif is_market_query:
                # Job market context
                report = bio.get("ai_report", {})
                if report is None or isinstance(report, str):
                    report = {}
                recs = report.get("recommendations", []) if report else []
                top_rec = recs[0].get("title", "General Path") if recs and len(recs) > 0 else "General Path"

                
                context_str = f"""
                You are an AI Career Mentor helping {name} understand job markets.
                {lang_instruction}
                
                Student's Top Career Path: {top_rec}
                Location: {location}
                
                Task: Provide REALISTIC job market insights:
                - Entry-level salary ranges in Gujarat/India
                - Current demand (High/Medium/Low)
                - Skills needed
                - Growth prospects (1 year, 3 years, 5 years)
                
                Be honest about challenges but encouraging. Keep responses concise (4-5 sentences).
                """
            else:
                # General career guidance - Ultra-lite
                context_str = f"""
                You are a supportive Career Mentor for {name}.
                {lang_instruction}
                
                Provide practical, encouraging advice based on conversation context.
                Keep responses brief (2-3 sentences) and actionable.
                """
        else:
            # FIRST INTERACTION: Rich context to seed the conversation
            report = bio.get("ai_report", {})
            if report is None or isinstance(report, str):
                report = {}  # Safety check
            
            # Extract comprehensive profile
            recs = report.get("recommendations", []) if report else []
            top_rec = recs[0].get("title", "General Path") if recs and len(recs) > 0 else "General Path"
            strengths = report.get("topStrengths", []) if report else []
            skills = report.get("recommendedSkills", []) if report else []

            
            if is_platform_query:
                # First message about platform
                context_str = f"""
                You are an AI Career Mentor for {name} on UdaanSetu.AI.
                
                {platform_context}
                
                --- USER PROFILE ---
                Education: {education}
                Location: {location}
                
                {lang_instruction}
                
                Task: Welcome them and explain how UdaanSetu.AI helps rural students.
                Be warm, concise (3-4 sentences), and inspiring.
                """
            else:
                # First career guidance message - Rich context
                interests = bio.get("interest_domains", [])
                context_str = f"""
                You are an AI Career Mentor for {name} on UdaanSetu.AI.
                {lang_instruction}
                
                --- COMPREHENSIVE STUDENT PROFILE ---
                Education: {education}
                Location: {location}
                Interests: {', '.join(interests) if interests else 'Exploring options'}
                
                --- AI ASSESSMENT RESULTS ---
                Top Career Path: {top_rec}
                Career Readiness: {report.get("careerReadiness", "Under evaluation")}%
                Top Strengths: {', '.join(strengths[:3]) if strengths else 'Being assessed'}
                Priority Skills to Learn: {', '.join([s.get('name', '') for s in skills[:3]]) if skills else 'To be determined'}
                
                --- YOUR ROLE ---
                - Provide personalized, practical career guidance
                - Suggest FREE learning resources (YouTube, Coursera, government schemes)
                - Be honest about challenges but always encouraging
                - Help with skills, roadmaps, salary expectations, and career paths
                - Keep responses concise (3-5 sentences) and actionable
                
                Remember: {name} is from a rural area with limited resources. Prioritize:
                1. Low-cost or FREE learning options
                2. Remote/online opportunities
                3. Realistic timelines (3-6 months for basic skills)
                4. Local Gujarat opportunities when relevant
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
            response = await llm.ainvoke(messages)
            return response.content
        except Exception as e:
            return f"I'm having trouble connecting. Please try again. ({str(e)})"

# Singleton
mentor_service = MentorChatService()

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
        Optimized Chat Mentor Logic.
        Uses explicit 'Lite Context' for follow-ups to save tokens/time.
        """
        llm = self._get_llm()
        if not llm:
            return "AI Service Unavailable."

        # Extract basic info
        bio = student_profile.get("generated_bio", {})
        name = bio.get("name", "Student")
        
        # Define Language Instruction
        lang_instruction = "Answer in ENGLISH."
        if language == "gu":
             lang_instruction = "IMPORTANT: Answer purely in GUJARATI script (ગુજરાતી). Do not use English unless defining a specific technical term."
        elif language == "hinglish":
             lang_instruction = "Answer in Hinglish (Hindi + English mix)."
        
        # --- UdaanSetu.AI Platform Context ---
        platform_context = """
        --- ABOUT UDAANSETU.AI PLATFORM ---
        UdaanSetu.AI (Udaan = Flight, Setu = Bridge) is an AI-powered Career Mentor Platform designed specifically for rural youth in India (Class 10-12 students and dropouts).
        
        **Mission**: "Bridging Rural Dreams to Digital Futures" - We help rural students overcome the "Guidance Gap" by providing personalized, actionable, and culturally relevant career guidance.
        
        **Core Features**:
        1. **Gamified Assessment Engine**: 20+ adaptive questions that map traits like Leadership, Mobility, Financial Attitude, Risk-taking, and Creativity
        2. **Deep Profiling**: Analyzes Psychology (Risk, Creativity), Background (Family Income, Mobility), and Interests
        3. **Dynamic Factor Analysis**: Scores users on "Billionaire Mindset", "Start-up Aptitude", or "Stable Job Fit"
        4. **AI Career Reports (RAG)**: Provides SWOT Analysis and 3 tailored career paths:
           - The Safe Path (Government/Stable Jobs)
           - The Growth Path (Tech/Private Sector)
           - The Dream Path (Entrepreneurship/Creative)
        5. **Actionable Roadmaps**: 6-month step-by-step learning guides
        6. **Bilingual Support**: Full support for English and Gujarati (ગુજરાતી)
        7. **Interactive Chat Mentor**: Real-time career counseling with context-aware AI
        8. **Resource Library**: Curated resources including YouTube videos, websites, government schemes, scholarships
        
        **Technology Stack**:
        - Frontend: Next.js 14 with Tailwind CSS and Glassmorphism UI
        - Backend: Python FastAPI for fast, async API
        - AI/LLM: Google Gemini Pro for empathetic, context-aware responses
        - Database: Firebase Firestore for scalable NoSQL storage
        
        **Problems We Solve**:
        1. Information Asymmetry: Rural youth have internet but not curated, relevant career paths
        2. Language Barrier: Most career advice is in English, alienating vernacular speakers
        3. Generic Advice: Traditional tools give generic advice without considering economic reality, education level, or local constraints
        
        **Organization & Team**:
        - **Organization**: FutureMinds (Social Impact Tech Initiative)
        - **Lead Developer**: Dhruv Patel
        - **UI Designer**: Prajwal Yadav
        - **Frontend Developer**: Vasu Patil
        -- **Backend Developer**: Sanjarkhan Kaliyani
        - **Team Goal**: Democratizing career guidance for the next 100 million students in rural India.
        
        **Created By**: Team FutureMinds, led by Dhruv Patel 
        **Made For**: India 🇮🇳 with ❤️
        """
        
        # Check if query is about UdaanSetu platform (smart detection)
        query_lower = query.lower()
        is_platform_query = any(keyword in query_lower for keyword in [
            'udaansetu', 'ઉડાનસેતુ', 'platform', 'app', 'પ્લેટફોર્મ', 
            'what is', 'શું છે', 'features', 'વિશેષતા', 'team', 'ટીમ'
        ])
        
        # --- Context Strategy ---
        if len(history) > 0:
            # LITE MODE: User is already chatting - minimal context
            if is_platform_query:
                # Only add platform context if asking about the platform
                context_str = f"""
                You are a helpful Career Mentor for UdaanSetu.AI, helping {name}.
                {lang_instruction}
                
                {platform_context}
                
                Explain our features, mission, and how we help rural students.
                Keep it concise and focused.
                """
            else:
                # Ultra-lite mode for career questions - FAST
                context_str = f"""
                You are a helpful Career Mentor for {name}.
                {lang_instruction}
                Keep responses short (2-3 sentences), practical, and encouraging.
                Focus on actionable advice based on previous conversation context.
                """
        else:
            # RICH MODE: First interaction.
            # We inject the full computed report to "seed" the conversation.
            report = bio.get("ai_report", {})
            if isinstance(report, str): report = {} # Safety check
            
            # Extract top recommendation safely
            recs = report.get("recommendations", [])
            top_rec = recs[0].get("title", "General Path") if recs else "General Path"
            
            if is_platform_query:
                # First message about platform
                context_str = f"""
                You are an AI Career Mentor for {name} on UdaanSetu.AI.
                
                {platform_context}
                
                --- USER PROFILE ---
                Education: {bio.get("education", "Unknown")}
                Location: {bio.get("location", "Gujarat")}
                
                {lang_instruction}
                Explain how UdaanSetu.AI helps rural students. Be welcoming and concise.
                """
            else:
                # First message about career - focused context, FASTER
                context_str = f"""
                You are an AI Career Mentor for {name} on UdaanSetu.AI.
                
                --- USER PROFILE ---
                Education: {bio.get("education", "Unknown")}
                Location: {bio.get("location", "Gujarat")}
                Interests: {bio.get("interest_domains", [])}
                
                --- CAREER SUMMARY ---
                Top Path: {top_rec}
                Readiness: {report.get("careerReadiness", "Unknown")}%
                Strengths: {", ".join(report.get("topStrengths", [])[:3])}
                
                {lang_instruction}
                Help with career guidance. Be friendly and practical. Keep responses concise (3-4 sentences).
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

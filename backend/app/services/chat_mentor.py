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
                temperature=0.7
            )
        return None

    async def chat_with_mentor(self, history: list, student_profile: dict, query: str) -> str:
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
        
        # --- Context Strategy ---
        if len(history) > 0:
            # LITE MODE: User is already chatting.
            # We assume the LLM remembers previous turns via the 'history' list we pass.
            # We just provide a light persona reminder.
            context_str = f"""
            You are a helpful Career Mentor for {name}.
            Keep responses short, practical, and encouraging.
            Answer firmly based on previous context.
            """
        else:
            # RICH MODE: First interaction.
            # We inject the full computed report to "seed" the conversation.
            report = bio.get("ai_report", {})
            if isinstance(report, str): report = {} # Safety check
            
            # Extract top recommendation safely
            recs = report.get("recommendations", [])
            top_rec = recs[0].get("title", "General Path") if recs else "General Path"
            
            context_str = f"""
            You are an AI Career Mentor for {name}.
            
            --- USER PROFILE ---
            Education: {bio.get("education", "Unknown")}
            Location: {bio.get("location", "Gujarat")}
            Interests: {bio.get("interest_domains", [])}
            
            --- CAREER REPORT SUMMARY ---
            Top Recommendation: {top_rec}
            Readiness: {report.get("careerReadiness", "Unknown")}%
            Strengths: {", ".join(report.get("topStrengths", []))}
            
            --- GOAL ---
            Help the student understand their career path.
            Be friendly, use simple English (or Gujarati if asked).
            Do NOT hallucinate new job openings; stick to the profile context.
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

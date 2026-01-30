"""
Mentor Chat Engine [Module 3]
Advanced, personalized career mentorship using RAG and personality synthesis.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import os
import json
import logging
from dotenv import load_dotenv

# Configure logger
logger = logging.getLogger(__name__)

load_dotenv()

class MentorEngine:
    PLATFORM_CONTEXT = """
    <platform>
    NAME: UdaanSetu
    MISSION: Empower rural Indian youth to find their ideal career paths.
    </platform>
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-2.5-flash" 
        self._llm = None

    @property
    def llm(self):
        if self._llm is None and self.api_key:
            try:
                self._llm = ChatGoogleGenerativeAI(
                    model=self.model_name, 
                    google_api_key=self.api_key,
                    temperature=0.4,
                    max_output_tokens=2048,
                )
            except Exception as e:
                logger.error(f"Error initializing LLM: {e}")
                return None
        return self._llm

    async def chat(self, history: list, student_profile: dict, query: str, language: str = "en", career_report: dict = None, assessment_result: dict = None):
        """
        Module 3: Mentor Chat Engine (The "Guide")
        Context-aware career mentorship using Bio, Report, and Knowledge Base (RAG).
        """
        llm = self.llm
        if not llm:
            yield "SYSTEM_ERROR: Mentor offline."
            return

        # 1. Fetch Knowledge Base Context (RAG)
        from app.services.rag_engine import get_rag_engine
        rag_engine = get_rag_engine()
        
        # Combine query with career recommendation if available for better RAG
        target_career = student_profile.get("snapshot", {}).get("top_recommendation", "")
        rag_query = f"{query} {target_career}"
        rag_context = rag_engine.get_context_for_query(rag_query, student_profile, k=3)

        # 2. Parse Other Context
        basic_info = student_profile.get("basic_info", {})
        name = basic_info.get("name", "Friend")
        loc = basic_info.get("location", "Gujarat")
        edu = basic_info.get("education", "School")

        career_summary = ""
        if career_report:
            recs = [r.get("title") for r in career_report.get("recommendations", [])[:2]]
            career_summary = f"CAREER GOAL: {target_career or ', '.join(recs)}"

        # 3. Prompt Engineering
        lang_mode = "ENGLISH" if language != "gu" else "GUJARATI"
        
        system_message = f"""
        ACT AS: UdaanSetu Mentor - Senior Career Psychologist & Strategic Life Coach.
        MISSION: Guide {name} ({edu} from {loc}) towards career success.
        
        CONTEXT:
        [Student Bio]: {json.dumps(student_profile)}
        [Career Summary]: {career_summary}
        [Verified Knowledge]: {rag_context}
        
        INSTRUCTIONS:
        1. Be authoritative yet encouraging (Mentor persona).
        2. Use the 'Verified Knowledge' to provide factual advice.
        3. Reference the student's specific traits/report when possible.
        4. ALWAYS respond in {lang_mode}.
        5. Keep answers concise but strategic.
        6. give only correct and relvent sources and right guidance to {name}
        """
        
        messages = [SystemMessage(content=system_message)]
        # Add limited history for performance
        for msg in history[-5:]:
             if msg.get("role") == "user": messages.append(HumanMessage(content=msg.get("content")))
             else: messages.append(AIMessage(content=msg.get("content")))
        messages.append(HumanMessage(content=query))

        try:
            async for chunk in self.llm.astream(messages):
                yield chunk.content
        except Exception as e:
            logger.error(f"Chat Error: {e}")
            yield "I'm having a technical glitch. Try again in a moment."

# Singleton instance
mentor_engine = MentorEngine()

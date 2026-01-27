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
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-2.0-flash" 
        self._llm = None

    @property
    def llm(self):
        if self._llm is None and self.api_key:
            try:
                self._llm = ChatGoogleGenerativeAI(
                    model=self.model_name, 
                    google_api_key=self.api_key,
                    temperature=0.4,
                    max_output_tokens=1024,
                )
            except Exception as e:
                logger.error(f"Error initializing LLM: {e}")
                return None
        return self._llm

    async def chat(self, history: list, student_profile: dict, query: str, language: str = "en"):
        """
        Personalized AI Mentorship logic.
        """
        from app.services.rag_engine import get_rag_engine

        llm = self.llm
        if not llm:
            yield "SYSTEM_ERROR: Mentor offline. Please check your internet connection."
            return

        # Profile Parsing
        bio = student_profile.get("generated_bio", student_profile)
        name = bio.get("name", "Student")
        education = bio.get("education", "Unknown Class")
        location = bio.get("location", "Gujarat")
        interests = bio.get("interest_domains", [])
        constraints = bio.get("constraints", [])

        # RAG Retrieval
        rag_context = ""
        try:
            rag_engine = get_rag_engine()
            rag_context = rag_engine.get_context_for_query(query=query, user_profile=bio, k=4)
        except Exception as e:
            logger.error(f"RAG_ERROR: {e}")
            rag_context = "<status>KNOWLEDGE_BASE_OFFLINE</status>"

        # Personality & Language Setup
        lang_instruction = "Output Language: SIMPLE ENGLISH."
        if language == "gu":
            lang_instruction = "Output Language: GUJARATI (ગુજરાતી) (Friendly & Polite)."

        system_message = f"""
<persona>
You are 'UdaanSetu', an empathetic AI Career Mentor for rural youth in Gujarat.
You behave like an elder sibling (Mota Bhai/Bena) - caring, motivating, but very strategic.
</persona>

<knowledge_context>
{rag_context}
</knowledge_context>

<user_profile>
- NAME: {name}
- EDUCATION: {education}
- LOCATION: {location}
- INTERESTS: {interests}
- BARRIERS: {constraints}
</user_profile>

<instructions>
1. Start with a brief thought trace in italics: *Thinking about {name}'s career path...*
2. provide actionable, low-cost advice.
3. Use the knowledge context to cite facts/schemes.
4. End with 2-3 specific follow-up questions for the student.
5. {lang_instruction}
</instructions>
"""

        messages = [SystemMessage(content=system_message)]
        for msg in history[-8:]:
            role = msg.get("role")
            content = msg.get("content", "")
            if role == "user": messages.append(HumanMessage(content=content))
            elif role == "assistant": messages.append(AIMessage(content=content))
        
        messages.append(HumanMessage(content=query))

        try:
            async for chunk in self.llm.astream(messages):
                yield chunk.content
        except Exception as e:
            logger.error(f"GEN_ERROR: {e}")
            yield "I am thinking deeply about your question. Please give me a moment."

# Singleton instance
mentor_engine = MentorEngine()

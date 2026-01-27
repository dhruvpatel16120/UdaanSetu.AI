from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import os
import json
from dotenv import load_dotenv

import logging

# Configure logger
logger = logging.getLogger(__name__)

load_dotenv()

class MentorChatService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Using the latest available flash model for speed + intelligence
        self.model_name = "gemini-2.5-flash" 
        self._llm = None

    @property
    def llm(self):
        """Lazy initialization of LLM to handle potential API key updates or failures gracefully."""
        if self._llm is None and self.api_key:
            try:
                self._llm = ChatGoogleGenerativeAI(
                    model=self.model_name, 
                    google_api_key=self.api_key,
                    temperature=0.4, # Balanced for creativity and accuracy
                    top_p=0.9,
                    top_k=40,
                    max_output_tokens=1024,
                )
            except Exception as e:
                print(f"Error initializing LLM: {e}")
                return None
        return self._llm

    async def chat_with_mentor(self, history: list, student_profile: dict, query: str, language: str = "en"):
        """
        Hyper-Personalized Advanced Generator [v2.5]
        Uses Gemini 2.5 Flash with Recursive Personalization Logic.
        """
        from app.services.rag_engine import get_rag_engine

        llm = self.llm
        if not llm:
            yield "SYSTEM_ERROR: Mentor offline. Check connection."
            return

        # 1. DEEP USER ANALYSIS (Profile Parsing)
        bio = student_profile.get("generated_bio", student_profile)
        name = bio.get("name", "Student")
        education = bio.get("education", "Unknown Class")
        location = bio.get("location", "Gujarat")
        interests = bio.get("interest_domains", [])
        constraints = bio.get("constraints", [])
        family_income = bio.get("family_income", "Unknown")

        # 2. SEMANTIC RETRIEVAL (The Precision Engine)
        rag_context = ""
        try:
            rag_engine = get_rag_engine()
            # Multi-stage retrieval: Vector Search -> Cross-Encoder Reranking
            rag_context = rag_engine.get_context_for_query(query=query, user_profile=bio, k=4)
        except Exception as e:
            logger.error(f"RAG_ERROR: {e}")
            rag_context = "<status>KNOWLEDGE_BASE_OFFLINE</status>"

        # 3. PERSONALIZED MAGIC FORMULA ARCHITECTURE
        lang_instruction = "Output Language: SIMPLE ENGLISH with very clear and simple understanding."
        if language == "gu":
            lang_instruction = "Output Language: Normal, polite, and easily understandable GUJARATI (ગુજરાતી) with technical terms translated/bracketed."

        system_message = f"""
<persona>
You are 'UdaanSetu', a Next-Gen AI Career Architect for rural Gujarat.
You combine the empathy of an 'Elder Sibling' (Mota Bhai/Bena) with the strategic intelligence of a top-tier Career Counselor.
Your mission: To bridge the gap from 'Village to Vision'.
Tone: Inspiring, high-energy, extremely structured, and deeply rooted in Gujarati culture.
</persona>

<knowledge_context>
{rag_context}
</knowledge_context>

<internal_reasoning>
1. DECODE: Analyze {name}'s hidden potential based on {interests} and {education}.
2. MAP: Connect {name} to the 2026-2027 high-growth sectors in Gujarat (Semiconductors at Dholera, Fintech in GIFT City, Green Energy in Kutch).
3. STRATEGIZE: Create a step-by-step 'Setu' (Bridge) that skips the fluff and focuses on actionable skills.
4. SOLVE: Directly address barriers ({constraints}) with low-cost, high-impact alternatives (e.g., YouTube learning, Gov Schemes).
</internal_reasoning>

<user_profile>
- NAME: {name}
- EDUCATION: {education}
- LOCATION: {location}
- INTERESTS: {interests}
- FAMILY_INCOME: {family_income}
- BARRIERS/CONSTRAINTS: {constraints}
</user_profile>

<format_requirements>
1. **Thinking Process**: Start your response with a brief, italicized thought trace: *Searching 2026 job trends for {name}... Analyzing local opportunities in {location}...*
2. **The Hook**: A powerful, personalized opening line.
3. **The Roadmap (Action Plan)**: Use a clear structure:
   - 🎯 **Goal**: The detailed target career.
   - 🛠️ **Skills**: 3 must-have skills.
   - 🔗 **Resources**: Specific links/schemes from context.
4. **The 'Setu' (Bridge)**: How to start *today* with zero cost.
5. **Next Steps**: End with 3 clickable-style questions:
   - "👉 Tell me more about [Specific Course]?"
   - "👉 How can I earn while learning this?"
   - "👉 What is the salary in 2026?"
</format_requirements>

<guardrails>
- TRUTH_ONLY: Cite source file/chunk after every claim [Source: ...].
- LANGUAGE: {lang_instruction}
- ACCESSIBILITY: No jargon without explanation.
- SAFETY: Prevent financial traps.
</guardrails>
"""

        # 4. MEMORY & MESSAGE CHAIN
        messages = [SystemMessage(content=system_message)]
        for msg in history[-8:]:
            role = msg.get("role")
            content = msg.get("content", "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
        
        messages.append(HumanMessage(content=query))

        # 5. STREAMING GENERATION
        try:
            async for chunk in self.llm.astream(messages):
                yield chunk.content
        except Exception as e:
            logger.error(f"GEN_ERROR: {e}")
            yield "The Mentor is currently thinking deeply. Please wait a moment."


# Singleton Instance
mentor_service = MentorChatService()

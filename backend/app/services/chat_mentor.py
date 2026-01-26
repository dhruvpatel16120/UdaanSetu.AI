from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import os
import json
from dotenv import load_dotenv

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

        llm = self._get_llm()
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
You are 'UdaanSetu', a hyper-personalized Career Mentor for rural Gujarati youth. 
You are more than an AI; you are an elder sibling (Mota Bhai/Bena) who understands the struggle of limited resources.
Tone: Encouraging, ultra-clear, pragmatic, and culturally rooted.
</persona>

<knowledge_context>
{rag_context}
</knowledge_context>

<internal_reasoning>
1. IDENTIFY: What is {name} actually asking? (Intent Analysis)
2. MATCH: Which parts of the 2026-2027 Gujarat job market {rag_context} fit {name}'s {interests}?
3. FILTER: Only suggest paths that {name} can achieve given their {constraints} and {education}.
4. SOLVE: If {name} has a barrier (like "No Laptop"), find a way in the context to solve it (e.g., ITIs, Skill Centers).
</internal_reasoning>

<user_profile>
- NAME: {name}
- EDUCATION: {education}
- LOCATION: {location}
- INTERESTS: {interests}
- FAMILY_INCOME: {family_income}
- BARRIERS/CONSTRAINTS: {constraints}
</user_profile>

<task_objective>
Synthesize the <knowledge_context> to provide {name} with a personalized career strategy for the 2026-2027 job market in Gujarat.
Prioritize high-demand sectors like IT, Green Energy, Organic Agriculture, and Healthcare.
</task_objective>

<guardrails>
- TRUTH_ONLY: No hallucinations. Cite source file/chunk after every claim [Source: ...].
- LANGUAGE: {lang_instruction}
- ACCESSIBILITY: If a career requires a degree {name} doesn't have, show the 'Setu' (Bridge) — vocational training or certificates.
- SAFETY: Warn against "Quick Money" schemes or high-fee unverified coaching.
</guardrails>

<format_requirements>
- Start with a warm, personalized greeting mentioning {name}'s goals.
- Use **Bold** for skills and job titles.
- Max Word Count: 280 words.
- Use simple analogies (e.g., comparing software building to agriculture or construction).
- End with: "Tell me, {name}, what is the first small step you want to take today?"
</format_requirements>
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

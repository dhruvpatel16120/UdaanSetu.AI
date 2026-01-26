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
        Advanced Streaming Chat Mentor with Deep Context & empathetic Persona.
        """
        if not self.llm:
            yield "⚠️ AI Service is currently unavailable (API Key missing or invalid)."
            return

        # --- 1. Deep Profile Extraction ---
        bio = student_profile.get("generated_bio", {})
        name = bio.get("name", "Student")
        education = bio.get("education", "Standard 10/12")
        location = bio.get("location", "Gujarat, India")
        interests = bio.get("interest_domains", ["General Career"])
        
        # Get top career recommendation if available for focused guidance
        top_career = "Checking..."
        report = bio.get("ai_report", {})
        if report and isinstance(report, dict) and "recommendations" in report:
            recs = report["recommendations"]
            if recs and len(recs) > 0:
                top_career = recs[0].get("title", "General Path")

        # --- 2. Advanced System Persona ---
        # Determining Language Style
        if language == "gu":
            lang_instruction = "IMPORTANT: Respond in GUJARATI (ગુજરાતી) script. Use English for technical terms (e.g., 'Programming', 'AI') but explain them."
        else:
            lang_instruction = "Respond in Simple, Clear English. Identify as a helpful mentor."

        # Dynamic System Prompt
        system_prompt = f"""
        IDENTITY:
        You are 'Udaan', an Advanced AI Career Mentor designed specificallly for students in Rural India (Gujarat).
        Your mission is to bridge the gap between rural talent and digital opportunities.

        USER PROFILE:
        - Name: {name}
        - Education: {education}
        - Location: {location}
        - Interests: {interests}
        - Recognized Top Path: {top_career}

        CORE BEHAVIORS:
        1. **Empathetic & Encouraging**: Always start with a positive, validating tone. Use the student's name.
        2. **Holistic Guidance**: Don't just list jobs. Suggest *Free Learning Resources* (YouTube channels, Government portals like Swayam/NPTEL), *Skills* to learn, and *Roadmaps*.
        3. **Localized Context**: Understand the constraints of rural students (internet access, budget). Prioritize mobile-friendly and free solutions.
        4. **Platform Expert**: You are part of 'UdaanSetu.AI'. We offer AI Assessments, Career Reports, and Mentorship.
        
        RESPONSE FORMAT:
        - Use **Markdown** for clarity (Bold key terms, use Bullet points).
        - Keep paragraphs short (mobile-friendly).
        - {lang_instruction}

        GOAL:
        The user asks: "{query}"
        Provide a detailed, step-by-step, and motivating answer. If the question is vague, ask clarifying questions.
        """

        # --- 3. Context Management (History) ---
        messages = [SystemMessage(content=system_prompt)]
        
        # Add last 6 turns of history for continuity
        for msg in history[-6:]:
            role = msg.get("role")
            content = msg.get("content", "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "model" or role == "assistant":
                messages.append(AIMessage(content=content))
        
        # Add current query
        messages.append(HumanMessage(content=query))

        # --- 4. Streaming Execution with Error Handling ---
        try:
            async for chunk in self.llm.astream(messages):
                yield chunk.content
        except Exception as e:
            # Fallback for "Overloaded" or "Safety" errors
            error_msg = str(e)
            if "429" in error_msg:
                yield "I am receiving too many requests right now. Please wait a moment and try again."
            else:
                yield f"I encountered a thought hiccup. Please try asking again shortly. (Error: {error_msg})"

# Singleton Instance
mentor_service = MentorChatService()

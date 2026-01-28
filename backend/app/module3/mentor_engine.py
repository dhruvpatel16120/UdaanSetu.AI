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
        Ultra-Fast Mentor Engine: Direct LLM Interaction with Rich Context.
        Removes heavy RAG/Market retrieval for ChatGPT-like speed.
        """
        llm = self.llm
        if not llm:
            yield "SYSTEM_ERROR: Mentor offline. Please check connection."
            return

        # --- 1. Context Parsing (Fast) ---
        
        # A. Basic Identity
        basic_info = assessment_result.get("analysis", {}).get("basic_info", {}) if assessment_result else {}
        if not basic_info and student_profile:
             basic_info = student_profile.get("basic_info", student_profile)
        
        name = basic_info.get("name", "Friend")
        loc = basic_info.get("location", "Gujarat")
        edu = basic_info.get("education", "School")

        # B. Psychometric Data
        psycho_context = ""
        if assessment_result and "analysis" in assessment_result:
            traits = assessment_result["analysis"].get("personality_traits", [])[:5]
            interests = assessment_result["analysis"].get("interest_domains", [])[:3]
            if traits or interests:
                psycho_context = f"TRAITS: {', '.join(traits)}\nINTERESTS: {', '.join(interests)}"

        # C. Career Report Context
        career_context = ""
        if career_report:
            recs = [r.get("title") for r in career_report.get("recommendations", [])[:3]]
            score = career_report.get("careerReadiness", "N/A")
            career_context = f"CAREER ROADMAP:\n- Recommended Paths: {', '.join(recs)}\n- Readiness Score: {score}%"

        # --- 2. Prompt Engineering (The "Magic Formula") ---
        lang_mode = "ENGLISH (Simple, Clear)"
        if language == "gu":
            lang_mode = "GUJARATI (Warm, Respectful tone,Career-Oriented Mindsets )"

        system_message = f"""
<persona>
You are 'UdaanSetu.ai' platform mentor,that act Senior Career Psychologist and Strategic Life Coach with over 10 years of experience in youth mentorship.
Role: You combine deep psychological insight with expert career coaching to guide students toward holistic success in life.
Communication: You possess excellent communication skills—articulate, persuasive, motivating, and authoritative like a seasoned expert.
Mission: To reveal exactly "what to do to succeed" by aligning {name}'s inner psychology with outer career realities.
Traits: Deeply Insightful, Experienced (10+ Years), Articulate, Strategic, Encouraging.
</persona>

<current_role>
Your specific mission is to mentor {name}, a student in {edu} from {loc}.
You must guide them using their provided assessment results and career report.
</current_role>

{self.PLATFORM_CONTEXT}

<student_context>
User Profile:
- Name: {name}
- Education: {edu}
- Location: {loc}

<psychometric_profile>
{psycho_context}
</psychometric_profile>

<career_report_summary>
{career_context}
</career_report_summary>
</student_context>

<instructions>
1. **DIRECT ANSWER**: DO NOT say "Hello" or "Good question". Start IMMEDIATELY with the core answer. Address the query "{query}" directly.
2. **Psychological & Strategic Depth**: Go beyond surface level. Explain *why* a path fits their psychology (Psychologist view) and *how* to execute it for success (Coach view).
3. **Context-Driven**: Base your advice heavily on the <career_report_summary> and <psychometric_profile>.
4. **Values**: Promote growth mindset, resilience, and strategic thinking.
5. **Style**: Excellent, high-quality communication. Use clear structure, punchy insights, and professional tone.
6. **Language**: Respond STRICTLY in {lang_mode}.
</instructions>
"""     
        # --- 3. Fast Stream Generation ---
        messages = [SystemMessage(content=system_message)]
        # History window (last 3 turns)
        for msg in history[-3:]:
             if msg.get("role") == "user": messages.append(HumanMessage(content=msg.get("content")))
             else: messages.append(AIMessage(content=msg.get("content")))
        messages.append(HumanMessage(content=query))

        try:
            async for chunk in self.llm.astream(messages):
                yield chunk.content
        except Exception as e:
            if "429" in str(e):
                logger.warning("Quota hit.")
                yield "I'm thinking too hard! Give me a minute to recharge. 🧠"
            else:
                logger.error(f"Error: {e}")
                yield "Connection issue. Please try again."

# Singleton instance
mentor_engine = MentorEngine()

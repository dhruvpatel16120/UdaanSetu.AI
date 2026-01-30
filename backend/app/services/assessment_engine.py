import os
import json
import logging
from typing import List, Dict, Any, Optional
from app.data.Que_Bank.question_bank import get_questions
from app.services.ai_service import analyze_assessment_data, generate_student_bio

# Configure Logging
logger = logging.getLogger("uvicorn.error")

MAX_QUESTIONS = int(os.getenv("ASSESSMENT_QUESTION_COUNT", 15))

class AssessmentService:
    """
    Handles Pillar 1 & 2: Adaptive Assessment & Bio-Profile Generation.
    """
    
    def __init__(self):
        self.questions = {q["id"]: q for q in get_questions()}

    def get_next_question(self, answered_ids: List[str], last_answer: Optional[Dict] = None) -> Optional[Dict]:
        """Adaptive branching logic to find the next best question."""
        if len(answered_ids) >= MAX_QUESTIONS:
            return None

        # 1. Rule-based branching
        if last_answer:
            qid = last_answer.get("question_id")
            opt_id = last_answer.get("selected_option_id")
            q_data = self.questions.get(qid)
            
            if q_data and "options" in q_data:
                for opt in q_data["options"]:
                    if opt["id"] == opt_id and opt.get("next_question_id"):
                        nxt = opt["next_question_id"]
                        if nxt not in answered_ids:
                            return self.questions.get(nxt)

        # 2. Section-based breadth (fallback)
        import random
        answered_sections = {self.questions[aid]["section"] for aid in answered_ids if aid in self.questions}
        
        available_questions = [q for q in self.questions.values() if q["id"] not in answered_ids]
        
        # Try finding questions in new sections
        new_section_questions = [q for q in available_questions if q["section"] not in answered_sections]
        if new_section_questions:
            return random.choice(new_section_questions)
        
        # fallback: any available question
        if available_questions:
            return random.choice(available_questions)
                
        return None

    async def finalize_assessment(self, user_id: str, answers: List[Dict], basic_info: Dict) -> Dict[str, Any]:
        """
        Synthesizes the final results.
        1. Analyzes Psychometric Data (SWOT).
        2. Generates Bio-Profile.
        """
        # 1. Analyze with Gemini
        analysis = await analyze_assessment_data(answers)
        if not analysis:
            return {"error": "Failed to analyze assessment data."}

        # 2. Generate Bio-Profile
        bio_profile = await generate_student_bio(analysis, basic_info)
        
        # 3. Combine Results
        final_result = {
            "uid": user_id,
            "assessment_data": analysis,
            "profile": bio_profile,
            "timestamp": os.getenv("CURRENT_TIME", "2025-01-30")
        }
        
        return final_result

# Singleton Instance
assessment_service = AssessmentService()

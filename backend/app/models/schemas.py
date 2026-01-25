from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QuestionOption(BaseModel):
    id: str
    text: Dict[str, str] # {"en": "...", "gu": "..."}
    traits: Optional[Dict[str, str]] = None
    next_question_id: Optional[str] = None

class Question(BaseModel):
    id: str
    section: str
    type: str # single_choice, text, etc.
    text: Dict[str, str]
    options: Optional[List[QuestionOption]] = None
    next_question_id: Optional[str] = None

class Answer(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    text_answer: Optional[str] = None

class AssessmentState(BaseModel):
    current_question_id: str
    answers: List[Answer]
    # In a real app, we might store computed traits here too

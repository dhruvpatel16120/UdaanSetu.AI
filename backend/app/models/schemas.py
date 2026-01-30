from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class QuestionRule(BaseModel):
    if_choice: Optional[str] = None
    goto: Optional[str] = None
    trigger_flag: Optional[str] = None

class QuestionOption(BaseModel):
    id: str
    text: Dict[str, str] # {"en": "...", "gu": "..."}
    weights: Dict[str, float] = Field(default_factory=dict) # {"tech": 0.8, "ambition": 0.5}
    next_question_id: Optional[str] = None

class Question(BaseModel):
    id: str
    section: str
    type: str # single_choice, scale, text
    text: Dict[str, str]
    options: Optional[List[QuestionOption]] = None
    rules: Optional[List[QuestionRule]] = None
    next_question_id: Optional[str] = None

class Answer(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    text_answer: Optional[str] = None
    timestamp: float = Field(default_factory=lambda: 0.0)

class TraitScores(BaseModel):
    tech_competence: int = 0
    ambition: int = 0
    tech_affinity: int = 0
    financial_awareness: int = 0
    confidence: int = 0
    clarity: int = 0

class PathReadiness(BaseModel):
    safe_path: int = 0 # Govt/Stable
    growth_path: int = 0 # Tech/Private
    dream_path: int = 0 # Entrepreneurship

class IntelligenceProfile(BaseModel):
    user_id: str
    readiness_score: int = 0
    traits: TraitScores = Field(default_factory=TraitScores)
    paths: PathReadiness = Field(default_factory=PathReadiness)
    top_recommendation: Optional[str] = None # Safe Path, Growth Path, or Dream Path
    insights: List[Dict[str, str]] = [] # [{"en": "...", "gu": "..."}]
    bio: Dict[str, str] = {"en": "", "gu": ""}
    conflicts: List[str] = []
    logs: List[str] = [] # For audit trail

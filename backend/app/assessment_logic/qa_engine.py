"""
================================================================================
UdaanSetu.AI - Module 1: Adaptive Q&A Intelligence Engine
================================================================================
File: qa_engine.py
Purpose: Enterprise-grade intelligence engine for dynamic psychological profiling,
         automated scoring, conflict detection, and bilingual bio synthesis.
Version: 3.1.0
Author: Principal AI Architect
================================================================================
"""

import os
import time
from typing import List, Optional, Dict, Set
from app.data.Que_Bank.question_bank import get_questions
from app.models.schemas import (
    Answer, IntelligenceProfile, Question, TraitScores, PathReadiness
)
from app.services.db_firebase import save_assessment_result, save_user_profile
from app.services.ai_service import generate_profile_synthesis

# Adaptive Decision Tree constants
MAX_QUESTIONS = int(os.getenv("ASSESSMENT_QUESTION_COUNT", 15))

class IntelligentSession:
    """Handles the O(n) logic for a single user assessment session."""
    
    def __init__(self, user_id: str, existing_answers: List[Answer] = None):
        self.user_id = user_id
        self.answers = existing_answers or []
        self.questions = {q["id"]: q for q in get_questions()}
        self.logs = []
        self._log(f"Session initialized for {user_id}")

    def _log(self, message: str):
        self.logs.append(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}")

    def evaluate_next_question(self) -> Optional[dict]:
        """Determination of next question based on rules and weights."""
        if len(self.answers) >= MAX_QUESTIONS:
            self._log("Max questions reached.")
            return None

        asked_ids = {a.question_id for a in self.answers}
        
        # 1. Deterministic Rule Catching (Highest Priority)
        if self.answers:
            last_ans = self.answers[-1]
            last_q = self.questions.get(last_ans.question_id)
            
            # Check explicit Rules
            if last_q and "rules" in last_q:
                for rule in last_q["rules"]:
                    if rule.get("if_choice") == last_ans.selected_option_id:
                        goto_id = rule.get("goto")
                        if goto_id and goto_id not in asked_ids:
                            self._log(f"Rule Triggered: {last_ans.question_id} -> {goto_id}")
                            return self.questions.get(goto_id)

            # Check Option Links
            if last_q and "options" in last_q:
                selected_opt = next((o for o in last_q["options"] if o["id"] == last_ans.selected_option_id), None)
                if selected_opt and selected_opt.get("next_question_id"):
                    nxt = selected_opt["next_question_id"]
                    if nxt not in asked_ids:
                        self._log(f"Option Link: {last_ans.question_id} -> {nxt}")
                        return self.questions.get(nxt)

        # 3. Dynamic Selection (Fallback)
        available_qs = [q for q in self.questions.values() if q["id"] not in asked_ids]
        if not available_qs:
            return None
            
        # Prioritize different sections for breadth
        asked_sections = {self.questions[aid]["section"] for aid in asked_ids if aid in self.questions}
        new_section_qs = [q for q in available_qs if q["section"] not in asked_sections]
        
        target_q = new_section_qs[0] if new_section_qs else available_qs[0]
        self._log(f"Dynamic Choice: {target_q['id']}")
        return target_q

    async def build_intelligence_profile(self) -> IntelligenceProfile:
        """The core synthesis logic combining deterministic scoring and AI inference."""
        self._log("Starting Intelligence Profile Synthesis...")
        
        profile = IntelligenceProfile(user_id=self.user_id, logs=self.logs)
        traits = {"tech_competence": 0, "ambition": 0, "tech_affinity": 0, "financial_awareness": 0, "confidence": 0, "clarity": 0}
        paths = {"safe_path": 0, "growth_path": 0, "dream_path": 0}
        signals = []
        answer_map = {} # Map question_id -> selected_option_id
        history_text = []

        # 1. Deterministic Weighted Scoring
        for ans in self.answers:
            q = self.questions.get(ans.question_id)
            if not q: continue
            
            answer_map[ans.question_id] = ans.selected_option_id
            
            opt = next((o for o in q.get("options", []) if o["id"] == ans.selected_option_id), None)
            if not opt: continue
            
            # Prepare history for AI
            history_text.append(f"Q: {q['text']['en']} -> A: {opt['text']['en']}")

            # Apply Weights
            weights = opt.get("weights", {})
            for key, val in weights.items():
                if key in traits: traits[key] += val
                if key in paths: paths[key] += val
            
            # Check for Rules/Flags
            if "rules" in q:
                for rule in q["rules"]:
                    if rule.get("if_choice") == ans.selected_option_id and rule.get("trigger_flag"):
                        signals.append(rule["trigger_flag"])
                        self._log(f"Flag Triggered: {rule['trigger_flag']}")

        # Normalize Scores (Cap at 100)
        profile.traits = TraitScores(**{k: min(100, v) for k, v in traits.items()})
        profile.paths = PathReadiness(**{k: min(100, v) for k, v in paths.items()})
        profile.readiness_score = int(sum(traits.values()) / len(traits)) if traits else 0

        # 2. Logic-Based Conflict Detection
        # Rule A: High Income + Low Risk + No Training
        # We need to infer 'High Income' intent. Currently using Ambition score > 70 or specific path preference.
        # Let's use the explicit question logic where available.
        # q_risk_appetite: 'high_growth' vs 'guaranteed'
        # q_learning_attitude: 'quick_start' vs others
        
        risk_pref = answer_map.get("q_risk_appetite")
        learn_pref = answer_map.get("q_learning_attitude")
        biz_mind = answer_map.get("q_business_mindset")
        capital = answer_map.get("q_financial_capacity")

        # Conflict 1: Startup Dream but Zero Capital
        if biz_mind == "invest" and capital == "zero_capital":
            profile.conflicts.append("⚠️ Reality Check: You want to start a business/invest, but indicated zero capital availability.")
            signals.append("CONFLICT_STARTUP_NO_CAPITAL")

        # Conflict 2: High Growth (High Risk) Preference but unwilling to train
        if risk_pref == "high_growth" and learn_pref == "quick_start":
             profile.conflicts.append("⚠️ Reality Check: High-paying roles require significant skill building, but you prefer immediate earning without training.")
             signals.append("CONFLICT_GREED_NO_EFFORT")

        # Conflict 3: Safe Job preference but High Capital Investment intent (Contradiction)
        if risk_pref == "guaranteed" and biz_mind == "invest":
            profile.conflicts.append("⚠️ Contradiction: You prefer a safe, steady job but would invest capital aggressively.")

        # 3. Determine Top Recommendation
        path_scores = {
            "Safe Path (Government/Stable Jobs)": profile.paths.safe_path,
            "Growth Path (Tech/Private Sector)": profile.paths.growth_path,
            "Dream Path (Entrepreneurship/Creative)": profile.paths.dream_path
        }
        best_path = max(path_scores, key=path_scores.get)
        profile.top_recommendation = best_path

        # 4. Semantic Synthesis (Gemini)
        ai_data = await generate_profile_synthesis(profile, signals, history_text)
        profile.bio = ai_data.get("bio", {"en": "Analysis pending", "gu": "વિશ્લેષણ બાકી"})
        profile.insights = ai_data.get("insights", [])
        
        return profile


# --- Helper Functions for API Layer ---

async def start_assessment(user_id: str) -> dict:
    session = IntelligentSession(user_id)
    first_q = session.evaluate_next_question()
    return {"session_id": user_id, "first_question": first_q, "logs": session.logs}

async def process_answer(user_id: str, current_answers: List[Answer]) -> dict:
    session = IntelligentSession(user_id, current_answers)
    next_q = session.evaluate_next_question()
    return {"next_question": next_q, "logs": session.logs}

async def generate_final_profile(user_id: str, all_answers: List[Answer]) -> IntelligenceProfile:
    try:
        session = IntelligentSession(user_id, all_answers)
        profile = await session.build_intelligence_profile()
        
        # Save to Firebase (Soft Failure)
        success = await save_assessment_result(user_id, profile.dict())
        if not success:
            session._log("⚠️ Failed to save assessment to Firestore (Auth/Network issue).")
        
        # Sync to user profile (Soft Failure)
        try:
            # Note: We are using a simpler dict update here to avoid circular imports or complex dependency injection of the career generator
            # The career generator call can be moved to a background task or separate endpoint if it's heavy.
            # RETAINING ORIGINAL LOGIC:
            from app.career_logic.career_generator import generate_career_report
            basic_info = {"name": "User", "userId": user_id} 
            career_report = await generate_career_report(profile.dict(), basic_info)
            
            public_update = {
                "traits": profile.traits.dict(),
                "aiBio": profile.bio,
                "readiness": profile.readiness_score,
                "intelligence_report": profile.dict(),
                "report_data": career_report,
                "top_recommendation": profile.top_recommendation
            }
            await save_user_profile(user_id, public_update)
        except Exception as e:
            print(f"⚠️ Dashboard sync failed: {e}")
            session._log(f"Dashboard sync error: {e}")
        
        return profile
    except Exception as e:
        print(f"❌ CRITICAL ENGINE ERROR: {e}")
        # Return a baseline profile instead of crashing
        return IntelligenceProfile(user_id=user_id, logs=[f"Critical error: {e}"])

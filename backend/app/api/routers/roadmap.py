from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Optional
from app.module2.roadmap_engine import roadmap_engine
from app.services.db_firebase import init_firebase
from firebase_admin import firestore
import firebase_admin

router = APIRouter()

class RoadmapRequest(BaseModel):
    user_id: str
    career_path: str
    language: str = "en"
    
    @validator('user_id')
    def validate_user_id(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('User ID cannot be empty')
        if len(v) > 200:
            raise ValueError('User ID too long')
        return v
    
    @validator('career_path')
    def validate_career_path(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Career path must be at least 3 characters')
        if len(v) > 100:
            raise ValueError('Career path too long (max 100 characters)')
        # Remove any potentially dangerous characters
        dangerous_chars = ['<', '>', '{', '}', '\\', '|']
        if any(char in v for char in dangerous_chars):
            raise ValueError('Career path contains invalid characters')
        return v
    
    @validator('language')
    def validate_language(cls, v):
        v = v.lower().strip()
        if v not in ['en', 'gu']:
            raise ValueError('Language must be "en" or "gu"')
        return v

class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_career: str
    language: str = "en"
    
    @validator('current_skills')
    def validate_current_skills(cls, v):
        if not v:
            # Empty skills is okay
            return v
        if len(v) > 50:
            raise ValueError('Too many skills listed (max 50)')
        # Clean each skill
        cleaned_skills = []
        for skill in v:
            skill = skill.strip()
            if len(skill) > 100:
                raise ValueError('Individual skill name too long (max 100 characters)')
            if skill:  # Only add non-empty skills
                cleaned_skills.append(skill)
        return cleaned_skills
    
    @validator('target_career')
    def validate_target_career(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Target career must be at least 3 characters')
        if len(v) > 100:
            raise ValueError('Target career too long (max 100 characters)')
        return v
    
    @validator('language')
    def validate_language(cls, v):
        v = v.lower().strip()
        if v not in ['en', 'gu']:
            raise ValueError('Language must be "en" or "gu"')
        return v


@router.post("/generate")
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a personalized 6-month learning roadmap for a specific career path
    """
    try:
        # Fetch user profile from Firebase
        if not firebase_admin._apps:
            init_firebase()
        
        db = firestore.client()
        # Fetch bio/traits from the assessments collection
        doc = db.collection("assessments").document(request.user_id).get()
        
        if not doc.exists:
            # Fallback to general info if no assessment found
            student_bio = {"education": "12th", "location": "Gujarat", "traits": {}}
        else:
            student_data = doc.to_dict()
            student_bio = student_data.get("assessment_result", {}).get("generated_bio", {})
        
        # Generate roadmap
        roadmap = await roadmap_engine.generate_roadmap(
            career_path=request.career_path,
            student_bio=student_bio,
            language=request.language
        )
        
        return {"success": True, "roadmap": roadmap}
    
    except Exception as e:
        print(f"Roadmap generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-gap")
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Analyze the skill gap between current skills and target career
    """
    try:
        analysis = await roadmap_engine.get_skill_gap_analysis(
            current_skills=request.current_skills,
            target_career=request.target_career,
            language=request.language
        )
        
        return {"success": True, "analysis": analysis}
    
    except Exception as e:
        print(f"Skill gap analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/popular-paths")
async def get_popular_career_paths(language: str = "en"):
    """
    Get a list of popular career paths suitable for rural youth
    """
    paths_en = [
        {"id": "software-developer", "title": "Software Developer", "category": "Technology", "avg_salary": "3-8 LPA", "difficulty": "Medium"},
        {"id": "digital-marketing", "title": "Digital Marketing Specialist", "category": "Marketing", "avg_salary": "2-6 LPA", "difficulty": "Easy"},
        {"id": "graphic-designer", "title": "Graphic Designer", "category": "Creative", "avg_salary": "2-5 LPA", "difficulty": "Easy"},
        {"id": "data-analyst", "title": "Data Analyst", "category": "Technology", "avg_salary": "3-7 LPA", "difficulty": "Medium"},
        {"id": "content-writer", "title": "Content Writer", "category": "Creative", "avg_salary": "2-4 LPA", "difficulty": "Easy"},
        {"id": "web-developer", "title": "Web Developer", "category": "Technology", "avg_salary": "3-7 LPA", "difficulty": "Medium"},
        {"id": "social-media-manager", "title": "Social Media Manager", "category": "Marketing", "avg_salary": "2-5 LPA", "difficulty": "Easy"},
        {"id": "video-editor", "title": "Video Editor", "category": "Creative", "avg_salary": "2-5 LPA", "difficulty": "Easy"},
        {"id": "accountant", "title": "Accountant (Tally)", "category": "Finance", "avg_salary": "2-4 LPA", "difficulty": "Easy"},
        {"id": "electrician", "title": "Electrician (ITI)", "category": "Technical", "avg_salary": "15k-30k/month", "difficulty": "Easy"}
    ]
    
    paths_gu = [
        {"id": "software-developer", "title": "સોફ્ટવેર ડેવલપર", "category": "ટેકનોલોજી", "avg_salary": "3-8 લાખ/વર્ષ", "difficulty": "મધ્યમ"},
        {"id": "digital-marketing", "title": "ડિજિટલ માર્કેટિંગ નિષ્ણાત", "category": "માર્કેટિંગ", "avg_salary": "2-6 લાખ/વર્ષ", "difficulty": "સરળ"},
        {"id": "graphic-designer", "title": "ગ્રાફિક ડિઝાઇનર", "category": "સર્જનાત્મક", "avg_salary": "2-5 લાખ/વર્ષ", "difficulty": "સરળ"},
        {"id": "data-analyst", "title": "ડેટા વિશ્લેષક", "category": "ટેકનોલોજી", "avg_salary": "3-7 લાખ/વર્ષ", "difficulty": "મધ્યમ"},
        {"id": "content-writer", "title": "કન્ટેન્ટ લેખક", "category": "સર્જનાત્મક", "avg_salary": "2-4 લાખ/વર્ષ", "difficulty": "સરળ"},
        {"id": "web-developer", "title": "વેબ ડેવલપર", "category": "ટેકનોલોજી", "avg_salary": "3-7 લાખ/વર્ષ", "difficulty": "મધ્યમ"},
        {"id": "social-media-manager", "title": "સોશિયલ મીડિયા મેનેજર", "category": "માર્કેટિંગ", "avg_salary": "2-5 લાખ/વર્ષ", "difficulty": "સરળ"},
        {"id": "video-editor", "title": "વિડિયો એડિટર", "category": "સર્જનાત્મક", "avg_salary": "2-5 લાખ/વર્ષ", "difficulty": "સરળ"},
        {"id": "accountant", "title": "એકાઉન્ટન્ટ (ટેલી)", "category": "ફાઇનાન્સ", "avg_salary": "2-4 લાખ/વર્ષ", "difficulty": "સરળ"},
        {"id": "electrician", "title": "ઇલેક્ટ્રિશિયન (ITI)", "category": "તકનીકી", "avg_salary": "15-30 હજાર/મહિને", "difficulty": "સરળ"}
    ]
    
    if language == "gu":
        return {"success": True, "career_paths": paths_gu}
    else:
        return {"success": True, "career_paths": paths_en}

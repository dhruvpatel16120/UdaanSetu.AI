import google.generativeai as genai
import os
import json
import re

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def extract_json(text: str) -> dict:
    """Helper to extract JSON from AI response."""
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception as e:
        print(f"JSON extraction failed in Career Generator: {e} | Raw: {text}")
        return {}

async def generate_career_report(assessment_analysis: dict, basic_info: dict) -> dict:
    """
    Module 2: Career Report Generator
    Takes the raw assessment analysis (Psych profile) and generates a detailed, 
    actionable career report for the user.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
        ROLE: Elite Career Strategist & Recruitment Expert (20+ Years Exp).
        TASK: Generate a high-precision, "Boardroom Ready" Career Execution Plan for this candidate.
        
        INPUT DATA:
        ---
        PSYCHOMETRIC PROFILE:
        {json.dumps(assessment_analysis, indent=2)}
        ---
        CANDIDATE BASIC INFO:
        {json.dumps(basic_info, indent=2)}
        ---
        
        STRICT GUIDELINES:
        1. **NO GENERIC ADVICE**: Do not say "Work hard" or "Be confident". Give specific, actionable steps tailored to THIS profile.
        2. **FILL ALL FIELDS**: Every field in the JSON structure below matches a UI element. Do NOT leave any empty or null.
        3. **REALISTIC & AMBITIOUS**: Balance their current level with high-growth potential paths.
        4. **RICH CONTENT**: 
           - "recommendations": Provide exactly 3 distinctly different but suitable career paths.
           - "learningPaths": Provide concrete resources (e.g., "Coursera: Python for Everybody", not just "Online courses").
           - "actionPlan": Steps must be achievable in the timeframe.
        
        REQUIRED JSON OUTPUT STRUCTURE:
        {{
          "careerReadiness": <int 40-99 based on clarity of profile>,
          "topStrengths": ["<Specific Strength 1>", "<Specific Strength 2>", "<Specific Strength 3>", "<Specific Strength 4>"],
          "personalityTraits": ["<Trait 1>", "<Trait 2>", "<Trait 3>"],
          "recommendations": [
            {{
              "title": "<Job Title 1>",
              "match": <int 75-99>,
              "description": "<2 sentences: Why they fit this specific role based on their traits>",
              "requirements": ["<Hard Skill>", "<Soft Skill>", "<Qualification>"]
            }},
            {{
              "title": "<Job Title 2>",
              "match": <int 60-85>,
              "description": "<2 sentences: A clear alternative path>",
              "requirements": ["<Req 1>", "<Req 2>"]
            }},
             {{
              "title": "<Job Title 3 (Wildcard/High Growth)>",
              "match": <int 50-80>,
              "description": "<2 sentences: A challenging but rewarding option>",
              "requirements": ["<Req 1>", "<Req 2>"]
            }}
          ],
          "currentSkills": [
             {{ "name": "<Inferred Skill 1>", "level": <int 10-90> }},
             {{ "name": "<Inferred Skill 2>", "level": <int 10-90> }},
             {{ "name": "<Inferred Skill 3>", "level": <int 10-90> }}
          ],
          "recommendedSkills": [
             {{ "name": "<Crucial Missing Skill 1>", "priority": "high" }},
             {{ "name": "<Crucial Missing Skill 2>", "priority": "high" }},
             {{ "name": "<Standard Skill 3>", "priority": "medium" }}
          ],
          "learningPaths": [
             {{
                "title": "<Path 1 Name (Matches Rec 1)>",
                "duration": "<e.g. 6 Months>",
                "resources": [
                   {{ "name": "<Specific Course/Book Name>", "url": "https://coursera.orgOrSimilar" }},
                   {{ "name": "<Specific Tool/Platform>", "url": "https://..." }}
                ]
             }},
             {{
                "title": "<Path 2 Name (Matches Rec 2)>",
                "duration": "<e.g. 3 Months>",
                "resources": [
                   {{ "name": "<Resource Name>", "url": "https://..." }}
                ]
             }}
          ],
          "actionPlan": {{
             "shortTerm": ["<Day 1: Specific Task>", "<Week 1: Specific Task>", "<Month 1: Specific Task>"],
             "longTerm": ["<Month 6: Goal>", "<Year 1: Goal>"]
          }}
        }}
        """

        response = await model.generate_content_async(prompt)
        report = extract_json(response.text)
        
        if not report:
            # Fallback if JSON fails
            raise ValueError("Empty JSON response from LLM")
            
        return report

    except Exception as e:
        print(f"Career Report Generation Error: {e}")
        # Return a structure that indicates failure but prevents UI crash
        return {
            "careerReadiness": 50,
            "topStrengths": ["Resilience", "Adaptability"],
            "recommendations": [],
             "error": str(e)
        }

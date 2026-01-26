from typing import List, Dict, Any
import random

# Categories for dynamic selection
# 1. Education: q1_edu_level, q2_grades
# 2. Family: q3_family_type, q4_income
# 3. Interests: q5_interest, q6_hobbies
# 4. Psychology: q7_mindset_games
# 5. Future: q9_vision, q10_package
# 6. Reflection: q11_positive, q12_negative
# 7. Mobility: q13_shifting

QUESTIONS = [
    {
        "id": "q1_edu_level",
        "section": "Education",
        "type": "single_choice",
        "text": {"en": "What is your current education level?", "gu": "તમારું વર્તમાન શિક્ષણ સ્તર શું છે?"},
        "options": [
            {"id": "school", "text": {"en": "Class 8-10", "gu": "ધોરણ 8-10"}, "traits": {"edu": "school"}},
            {"id": "high_school", "text": {"en": "Class 11-12", "gu": "ધોરણ 11-12"}, "traits": {"edu": "high_school"}},
            {"id": "degree", "text": {"en": "Graduate / Degree", "gu": "સ્નાતક / ડિગ્રી"}, "traits": {"edu": "degree"}}
        ]
    },
    {
        "id": "q2_grades",
        "section": "Education",
        "type": "single_choice",
        "text": {"en": "How would you describe your academic performance?", "gu": "તમે તમારા શૈક્ષણિક પ્રદર્શનનું વર્ણન કેવી રીતે કરશો?"},
        "options": [
            {"id": "excellent", "text": {"en": "Excellent (80%+)", "gu": "ઉત્કૃષ્ટ (80%+)"}, "traits": {"performance": "high"}},
            {"id": "average", "text": {"en": "Average (50-70%)", "gu": "સરેરાશ (50-70%)"}, "traits": {"performance": "average"}},
            {"id": "low", "text": {"en": "Below Average", "gu": "સરેરાશથી ઓછું"}, "traits": {"performance": "low"}}
        ]
    },
    {
        "id": "q3_family_type",
        "section": "Family Background",
        "type": "single_choice",
        "text": {"en": "What is your family's primary background?", "gu": "તમારા પરિવારની મુખ્ય પૃષ્ઠભૂમિ શું છે?"},
        "options": [
            {"id": "business", "text": {"en": "Business Class", "gu": "વ્યવસાયિક વર્ગ"}, "traits": {"family": "business"}},
            {"id": "job", "text": {"en": "Service or Job Class", "gu": "નોકરી અથવા સેવા વર્ગ"}, "traits": {"family": "service"}}
        ]
    },
    {
        "id": "q4_income",
        "section": "Family Income",
        "type": "single_choice",
        "text": {"en": "What is your family's yearly income range?", "gu": "તમારા પરિવારની વાર્ષિક આવક કેટલી છે?"},
        "options": [
            {"id": "low", "text": {"en": "Below ₹3 Lakh", "gu": "₹3 લાખથી ઓછી"}, "traits": {"income": "low"}},
            {"id": "mid", "text": {"en": "₹3 Lakh - ₹7 Lakh", "gu": "₹3 લાખ - ₹7 લાખ"}, "traits": {"income": "medium"}},
            {"id": "high", "text": {"en": "Above ₹7 Lakh", "gu": "₹7 લાખથી વધુ"}, "traits": {"income": "high"}}
        ]
    },
    {
        "id": "q5_interest",
        "section": "Interest",
        "type": "single_choice",
        "text": {"en": "Which field excites you the most?", "gu": "તમને કયા ક્ષેત્રમાં સૌથી વધુ રસ છે?"},
        "options": [
            {"id": "tech", "text": {"en": "Technology & AI", "gu": "ટેકનોલોજી અને AI"}, "traits": {"field": "tech"}},
            {"id": "business", "text": {"en": "Business & Startups", "gu": "બિઝનેસ અને સ્ટાર્ટઅપ્સ"}, "traits": {"field": "business"}},
            {"id": "arts", "text": {"en": "Design & Creativity", "gu": "ડિઝાઇન અને સર્જનાત્મકતા"}, "traits": {"field": "arts"}}
        ]
    },
    {
        "id": "q6_hobbies",
        "section": "Hobbies",
        "type": "text",
        "text": {"en": "Tell us about your main hobbies.", "gu": "તમારા મુખ્ય શોખ વિશે અમને જણાવો."},
    },
    {
        "id": "q7_mindset_games",
        "section": "Psychology",
        "type": "single_choice",
        "text": {"en": "When using an app/game, are you interested in playing or how it was built?", "gu": "એપ્લિકેશન/ગેમનો ઉપયોગ કરતી વખતે, શું તમને તે રમવામાં રસ છે કે તે કેવી રીતે બની હશે તેમાં?"},
        "options": [
            {"id": "playing", "text": {"en": "Interested in just playing", "gu": "માત્ર રમવામાં રસ છે"}, "traits": {"mindset": "consumer"}},
            {"id": "building", "text": {"en": "Interested in how it works/built", "gu": "તે કેવી રીતે કાર્ય કરે છે/બની છે તેમાં રસ છે"}, "traits": {"mindset": "creator"}}
        ]
    },
    {
        "id": "q9_vision",
        "section": "Vision",
        "type": "text",
        "text": {"en": "Where do you see yourself in 5 years?", "gu": "તમે તમારી જાતને 5 વર્ષમાં ક્યાં જુઓ છો?"},
    },
    {
        "id": "q10_package",
        "section": "Expectations",
        "type": "single_choice",
        "text": {"en": "What is your expected starting monthly salary?", "gu": "તમારો અપેક્ષિત પ્રારંભિક માસિક પગાર કેટલો છે?"},
        "options": [
            {"id": "entry", "text": {"en": "₹20,000 - ₹40,000", "gu": "₹20,000 - ₹40,000"}},
            {"id": "high", "text": {"en": "Above ₹50,000", "gu": "₹50,000 થી વધુ"}}
        ]
    },
    {
        "id": "q11_positive",
        "section": "Self Reflection",
        "type": "text",
        "text": {"en": "What are your top 3 strengths?", "gu": "તમારી મુખ્ય 3 શક્તિઓ કઈ છે?"},
    },
    {
        "id": "q12_negative",
        "section": "Self Reflection",
        "type": "text",
        "text": {"en": "What is one area you want to improve in yourself?", "gu": "તમારામાં એક એવું ક્ષેત્ર કયું છે જેમાં તમે સુધારો કરવા માંગો છો?"},
    },
    {
        "id": "q13_shifting",
        "section": "Mobility",
        "type": "single_choice",
        "text": {"en": "Are you comfortable relocating to another city for a better job?", "gu": "શું તમે સારી નોકરી માટે બીજા શહેરમાં જવા માટે તૈયાર છો?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, anywhere", "gu": "હા, ક્યાંય પણ"}},
            {"id": "gujarat", "text": {"en": "Only within Gujarat", "gu": "માત્ર ગુજરાતમાં જ"}},
            {"id": "no", "text": {"en": "No, I prefer my current location", "gu": "ના, હું મારા વર્તમાન સ્થાને જ રહેવા માંગુ છું"}}
        ]
    }
]

def get_questions():
    return QUESTIONS

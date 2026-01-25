from typing import List, Dict, Any

# Updated 15-Question Bank strictly following User Request
# Categories: Education, Interest, Mindset, Family Income, Hobbies, Vision

INITIAL_QUESTIONS = [
    # --- STATIC LAYER (Hidden in Logic, collected via Form) ---
    {
        "id": "static_name",
        "section": "Static Layer",
        "type": "text",
        "text": {"en": "Full Name", "gu": "પૂરું નામ"},
        "next_question_id": "static_gender"
    },
    {
        "id": "static_gender",
        "section": "Static Layer",
        "type": "single_choice",
        "text": {"en": "Gender", "gu": "લિંગ"},
        "options": [
            {"id": "male", "text": {"en": "Male", "gu": "પુરુષ"}},
            {"id": "female", "text": {"en": "Female", "gu": "સ્ત્રી"}},
            {"id": "other", "text": {"en": "Other", "gu": "અન્ય"}}
        ],
        "next_question_id": "static_dob"
    },
    {
        "id": "static_dob",
        "section": "Static Layer",
        "type": "text",
        "text": {"en": "Date of Birth", "gu": "જન્મ તારીખ"},
        "next_question_id": "static_district"
    },
    {
        "id": "static_district",
        "section": "Static Layer",
        "type": "single_choice",
        "text": {"en": "District in Gujarat", "gu": "ગુજરાતનો જિલ્લો"},
        "options": [
            {"id": "ahmedabad", "text": {"en": "Ahmedabad", "gu": "અમદાવાદ"}},
            {"id": "surat", "text": {"en": "Surat", "gu": "સુરત"}},
            {"id": "rajkot", "text": {"en": "Rajkot", "gu": "રાજકોટ"}},
            {"id": "vadodara", "text": {"en": "Vadodara", "gu": "વડોદરા"}},
            {"id": "other", "text": {"en": "Other", "gu": "અન્ય"}}
        ],
        "next_question_id": "q1_edu_level"
    },

    # --- DYNAMIC SECTION 2: Background ---
    {
        "id": "q1_edu_level",
        "section": "Education",
        "type": "single_choice",
        "text": {
            "en": "What is your current education level?",
            "gu": "તમારું વર્તમાન શિક્ષણ સ્તર શું છે?"
        },
        "options": [
            {"id": "below_10", "text": {"en": "Class 8-10", "gu": "ધોરણ 8-10"}, "traits": {"education_level": "school"}, "next_question_id": "q2_grades"},
            {"id": "11_12", "text": {"en": "Class 11-12", "gu": "ધોરણ 11-12"}, "traits": {"education_level": "high_school"}, "next_question_id": "q2_grades"},
            {"id": "diploma", "text": {"en": "Diploma / ITI", "gu": "ડિપ્લોમા / આઈટીઆઈ"}, "traits": {"education_level": "vocational"}, "next_question_id": "q2_grades"},
            {"id": "graduate", "text": {"en": "Graduate / Pursuing Degree", "gu": "સ્નાતક / ડિગ્રી"}, "traits": {"education_level": "degree"}, "next_question_id": "q2_grades"},
            {"id": "dropout", "text": {"en": "Dropout", "gu": "અભ્યાસ છોડી દીધો"}, "traits": {"education_level": "dropout"}, "next_question_id": "q2_grades"}
        ]
    },
    {
        "id": "q2_grades",
        "section": "Education",
        "type": "single_choice",
        "text": {
            "en": "How were your academic grades in the last major exam?",
            "gu": "તમારી છેલ્લી પરીક્ષામાં તમારા શૈક્ષણિક ગ્રેડ કેવા હતા?"
        },
        "options": [
            {"id": "top_tier", "text": {"en": "Excellent (Above 80%)", "gu": "શ્રેષ્ઠ (80% થી વધુ)"}, "traits": {"academic_performance": "high"}, "next_question_id": "q3_family_type"},
            {"id": "mid_tier", "text": {"en": "Good (60% - 80%)", "gu": "સારું (60% - 80%)"}, "traits": {"academic_performance": "medium"}, "next_question_id": "q3_family_type"},
            {"id": "avg_tier", "text": {"en": "Average (40% - 60%)", "gu": "સરેરાશ (40% - 60%)"}, "traits": {"academic_performance": "average"}, "next_question_id": "q3_family_type"},
            {"id": "low_tier", "text": {"en": "Below Average (Less than 40%)", "gu": "સરેરાશથી ઓછું (40% થી ઓછું)"}, "traits": {"academic_performance": "low"}, "next_question_id": "q3_family_type"}
        ]
    },
    {
        "id": "q3_family_type",
        "section": "Family Background",
        "type": "single_choice",
        "text": {
            "en": "What is your family's primary occupation type?",
            "gu": "તમારા પરિવારનો મુખ્ય વ્યવસાય કેવો છે?"
        },
        "options": [
            {"id": "business", "text": {"en": "Business Class", "gu": "વ્યવસાયિક વર્ગ"}, "traits": {"family_background": "business"}, "next_question_id": "q4_income"},
            {"id": "service", "text": {"en": "Service or Job Class", "gu": "નોકરી અથવા સેવા વર્ગ"}, "traits": {"family_background": "service"}, "next_question_id": "q4_income"},
            {"id": "farming", "text": {"en": "Farming / Agriculture", "gu": "ખેતી / કૃષિ"}, "traits": {"family_background": "agriculture"}, "next_question_id": "q4_income"}
        ]
    },
    {
        "id": "q4_income",
        "section": "Family Income",
        "type": "single_choice",
        "text": {
            "en": "What is your family's approximate yearly income?",
            "gu": "તમારા પરિવારની આશરે વાર્ષિક આવક કેટલી છે?"
        },
        "options": [
            {"id": "low", "text": {"en": "Below ₹2.5 Lakh", "gu": "₹2.5 લાખથી ઓછી"}, "traits": {"financial_status": "low"}, "next_question_id": "q5_interest"},
            {"id": "mid", "text": {"en": "₹2.5 Lakh - ₹5 Lakh", "gu": "₹2.5 લાખ - ₹5 લાખ"}, "traits": {"financial_status": "medium"}, "next_question_id": "q5_interest"},
            {"id": "high", "text": {"en": "Above ₹5 Lakh", "gu": "₹5 લાખથી વધુ"}, "traits": {"financial_status": "high"}, "next_question_id": "q5_interest"}
        ]
    },

    # --- DYNAMIC SECTION 3: Interest & Psychology ---
    {
        "id": "q5_interest",
        "section": "Interest",
        "type": "single_choice",
        "text": {
            "en": "Which field interests you the most?",
            "gu": "તમને કયા ક્ષેત્રમાં સૌથી વધુ રસ છે?"
        },
        "options": [
            {"id": "tech", "text": {"en": "Technology & Computers", "gu": "ટેકનોલોજી અને કોમ્પ્યુટર"}, "traits": {"interest_domain": "tech"}, "next_question_id": "q7_mindset_games"},
            {"id": "arts", "text": {"en": "Creative Arts & Design", "gu": "સર્જનાત્મક કલા અને ડિઝાઇન"}, "traits": {"interest_domain": "arts"}, "next_question_id": "q6_hobbies"},
            {"id": "science", "text": {"en": "Science & Medicine", "gu": "વિજ્ઞાન અને દવા"}, "traits": {"interest_domain": "science"}, "next_question_id": "q11_positive"},
            {"id": "business", "text": {"en": "Management & Business", "gu": "મેનેજમેન્ટ અને બિઝનેસ"}, "traits": {"interest_domain": "business"}, "next_question_id": "q9_vision"}
        ]
    },
    {
        "id": "q6_hobbies",
        "section": "Hobbies",
        "type": "text",
        "text": {
            "en": "What are your main hobbies? (e.g., Drawing, Playing Cricket, Reading)",
            "gu": "તમારા મુખ્ય શોખ કયા છે? (દા.ત. ચિત્રકામ, ક્રિકેટ રમવું, વાંચન)"
        },
        "next_question_id": "q11_positive"
    },
    {
        "id": "q7_mindset_games",
        "section": "Psychology",
        "type": "single_choice",
        "text": {
            "en": "In games or apps, are you interested in just playing or how they are built?",
            "gu": "ગેમ્સ કે એપ્સમાં, તમને માત્ર રમવામાં રસ છે કે તે કેવી રીતે બની હશે તેમાં?"
        },
        "options": [
            {"id": "playing", "text": {"en": "Just playing and enjoying", "gu": "માત્ર રમવું અને આનંદ લેવો"}, "traits": {"tech_mindset": "consumer"}, "next_question_id": "q9_vision"},
            {"id": "building", "text": {"en": "Curious about how they are built", "gu": "તે કેવી રીતે બની હશે તેની જિજ્ઞાસા"}, "traits": {"tech_mindset": "creator"}, "next_question_id": "q9_vision"}
        ]
    },
    {
        "id": "q9_vision",
        "section": "Vision",
        "type": "text",
        "text": {
            "en": "What is your vision for your career? Where do you see yourself in 10 years?",
            "gu": "તમારી કારકિર્દી માટે તમારી દ્રષ્ટિ શું છે? 10 વર્ષ પછી તમે તમારી જાતને ક્યાં જુઓ છો?"
        },
        "next_question_id": "q10_package"
    },
    {
        "id": "q10_package",
        "section": "Expectations",
        "type": "single_choice",
        "text": {
            "en": "What is your expected monthly income (Package) in your first job?",
            "gu": "તમારી પ્રથમ નોકરીમાં તમારી અપેક્ષિત માસિક આવક (પેકેજ) કેટલી છે?"
        },
        "options": [
            {"id": "entry", "text": {"en": "₹15,000 - ₹25,000", "gu": "₹15,000 - ₹25,000"}, "traits": {"income_expectation": "low"}, "next_question_id": "q11_positive"},
            {"id": "mid", "text": {"en": "₹25,000 - ₹50,000", "gu": "₹25,000 - ₹50,000"}, "traits": {"income_expectation": "medium"}, "next_question_id": "q11_positive"},
            {"id": "high", "text": {"en": "Above ₹50,000", "gu": "₹50,000 થી વધુ"}, "traits": {"income_expectation": "high"}, "next_question_id": "q11_positive"}
        ]
    },
    {
        "id": "q11_positive",
        "section": "Self Reflection",
        "type": "text",
        "text": {
            "en": "What are the positive points about you? (Your Strengths)",
            "gu": "તમારામાં સારા ગુણો (સકારાત્મક પાસાઓ) કયા છે? (તમારી શક્તિઓ)"
        },
        "next_question_id": "q12_negative"
    },
    {
        "id": "q12_negative",
        "section": "Self Reflection",
        "type": "text",
        "text": {
            "en": "What are the negative points about you? (Areas of Improvement)",
            "gu": "તમારામાં નકારાત્મક પાસાઓ કયા છે? (સુધારણા માટેના ક્ષેત્રો)"
        },
        "next_question_id": "q13_shifting"
    },
    {
        "id": "q13_shifting",
        "section": "Mobility",
        "type": "single_choice",
        "text": {
            "en": "Are you able to shift to another city for your career?",
            "gu": "શું તમે તમારી કારકિર્દી માટે બીજા શહેરમાં જવા માટે તૈયાર છો?"
        },
        "options": [
            {"id": "yes", "text": {"en": "Yes, I can relocate anywhere", "gu": "હા, હું ક્યાંય પણ જઈ શકું છું"}, "traits": {"mobility": "yes"}},
            {"id": "no", "text": {"en": "No, I want to stay in my current location", "gu": "ના, મારે મારા વર્તમાન સ્થાને જ રહેવું છે"}, "traits": {"mobility": "no"}},
            {"id": "maybe", "text": {"en": "Only within Gujarat", "gu": "માત્ર ગુજરાતમાં જ"}, "traits": {"mobility": "partial"}}
        ]
    }
]

def get_questions():
    return INITIAL_QUESTIONS

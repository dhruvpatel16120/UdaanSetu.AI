"""
================================================================================
UdaanSetu.AI - Knowledge Base: Adaptive Intelligence Question Set
================================================================================
Purpose: Defines the dynamic decision tree and weighted scoring logic for
         Module 1 (Assessment Engine).
Version: 3.0.0
================================================================================
"""

QUESTIONS = [
    {
        "id": "q1_edu_status",
        "section": "Educational Foundation",
        "type": "single_choice",
        "text": {
            "en": "What is your current educational status?",
            "gu": "આપની વર્તમાન શૈક્ષણિક સ્થિતિ શું છે?"
        },
        "options": [
            {
                "id": "school", 
                "text": {"en": "In School (9th-12th)", "gu": "શાળામાં (9-12મું)"},
                "weights": {"clarity": 10, "ambition": 5},
                "next_question_id": "q2_stream_interest"
            },
            {
                "id": "college", 
                "text": {"en": "In College / Graduation", "gu": "કોલેજ / ગ્રેજ્યુએશનમાં"},
                "weights": {"clarity": 20, "ambition": 15},
                "next_question_id": "q3_future_vision"
            },
            {
                "id": "working", 
                "text": {"en": "Looking for Work / Skill Training", "gu": "કામ / કૌશલ્ય તાલીમની શોધમાં"},
                "weights": {"confidence": 10, "financial_awareness": 15},
                "next_question_id": "q4_work_preference"
            }
        ]
    },
    {
        "id": "q2_stream_interest",
        "section": "Direction",
        "type": "single_choice",
        "text": {
            "en": "Which stream interests you the most?",
            "gu": "તમને કયા પ્રવાહમાં સૌથી વધુ રસ છે?"
        },
        "options": [
            {
                "id": "science_tech", 
                "text": {"en": "Science & Technology", "gu": "વિજ્ઞાન અને ટેકનોલોજી"},
                "weights": {"tech_affinity": 30, "growth_path": 20},
                "next_question_id": "q_tech_hands_on"
            },
            {
                "id": "arts_commerce", 
                "text": {"en": "Arts, Commerce or Business", "gu": "કલા, વાણિજ્ય અથવા વ્યવસાય"},
                "weights": {"financial_awareness": 20, "dream_path": 15},
                "next_question_id": "q_business_mindset"
            }
        ]
    },
    {
        "id": "q_tech_hands_on",
        "section": "Skill Affinity",
        "type": "single_choice",
        "text": {
            "en": "Do you enjoy fixing things or building digital apps?",
            "gu": "શું તમને વસ્તુઓ રિપેર કરવી અથવા ડિજિટલ એપ્સ બનાવવી ગમે છે?"
        },
        "options": [
            {
                "id": "yes_logic", 
                "text": {"en": "Yes, I love logic and tools", "gu": "હા, મને લોજિક અને સાધનો ગમે છે"},
                "weights": {"tech_competence": 25, "growth_path": 30}
            },
            {
                "id": "no_theory", 
                "text": {"en": "Prefer studying theory/concepts", "gu": "થિયરી/ખ્યાલો ભણવાનું વધુ ગમે"},
                "weights": {"safe_path": 20, "clarity": 10}
            }
        ]
    },
    {
        "id": "q_business_mindset",
        "section": "Financial Drive",
        "type": "single_choice",
        "text": {
            "en": "If you are given 10,000 INR to start a project, what's your first move?",
            "gu": "જો તમને પ્રોજેક્ટ શરૂ કરવા માટે 10,000 રૂપિયા આપવામાં આવે, તો તમારું પ્રથમ પગલું શું હશે?"
        },
        "options": [
            {
                "id": "invest", 
                "text": {"en": "Buy raw materials/tools and start selling", "gu": "કાચો માલ/સાધનો ખરીદીને વેચાણ શરૂ કરીશ"},
                "weights": {"financial_awareness": 30, "dream_path": 40, "ambition": 20}
            },
            {
                "id": "save", 
                "text": {"en": "Keep it safe and plan carefully", "gu": "તેને સુરક્ષિત રાખીશ અને કાળજીપૂર્વક આયોજન કરીશ"},
                "weights": {"safe_path": 30, "financial_awareness": 10}
            }
        ],
        "rules": [
            {
                "if_choice": "invest",
                "trigger_flag": "ENTREPRENEURIAL_SIGNAL"
            }
        ]
    },
    {
        "id": "q_risk_appetite",
        "section": "Psychology",
        "type": "single_choice",
        "text": {
            "en": "What would you prefer for your future?",
            "gu": "ભવિષ્ય માટે તમે શું પસંદ કરશો?"
        },
        "options": [
            {
                "id": "guaranteed", 
                "text": {"en": "A steady job with fixed income (Low Risk)", "gu": "નિશ્ચિત આવકવાળી સ્થિર નોકરી (ઓછું જોખમ)"},
                "weights": {"safe_path": 40, "confidence": 10},
                "next_question_id": "q_financial_capacity"
            },
            {
                "id": "high_growth", 
                "text": {"en": "High-payout based on performance (High Risk)", "gu": "પરફોર્મન્સ આધારિત ઉચ્ચ આવક (વધારે જોખમ)"},
                "weights": {"ambition": 30, "growth_path": 20, "dream_path": 15},
                "next_question_id": "q_financial_capacity"
            }
        ]
    },
    {
        "id": "q_financial_capacity",
        "section": "Reality Check",
        "type": "single_choice",
        "text": {
            "en": "How much capital can you / your family invest if needed?",
            "gu": "જો જરૂર પડે તો તમે / તમારો પરિવાર કેટલું મૂડી રોકાણ કરી શકે છે?"
        },
        "options": [
            {
                "id": "zero_capital",
                "text": {"en": "Almost Zero / Very Little", "gu": "લગભગ શૂન્ય / ખૂબ ઓછું"},
                "weights": {"safe_path": 20},
                "next_question_id": "q_learning_attitude"
            },
            {
                "id": "moderate_capital",
                "text": {"en": "Moderate Investment Possible", "gu": "મધ્યમ રોકાણ શક્ય છે"},
                "weights": {"growth_path": 10, "financial_awareness": 10},
                "next_question_id": "q_learning_attitude"
            },
            {
                "id": "high_capital",
                "text": {"en": "Significant Capital Available", "gu": "નોંધપાત્ર મૂડી ઉપલબ્ધ છે"},
                "weights": {"dream_path": 20, "financial_awareness": 20},
                "next_question_id": "q_learning_attitude"
            }
        ]
    },
    {
        "id": "q_learning_attitude",
        "section": "Growth Mindset",
        "type": "single_choice",
        "text": {
            "en": "How much time are you willing to spend on learning new skills?",
            "gu": "નવા કૌશલ્યો શીખવા માટે તમે કેટલો સમય ફાળવવા તૈયાર છો?"
        },
        "options": [
            {
                "id": "quick_start",
                "text": {"en": "I want to start earning immediately", "gu": "હું તરત જ કમાવાનું શરૂ કરવા માંગુ છું"},
                "weights": {"safe_path": 10},
                "next_question_id": "q3_future_vision"
            },
            {
                "id": "some_training",
                "text": {"en": "I can spend 3-6 months learning", "gu": "હું શીખવા માટે 3-6 મહિનો કાઢી શકું છું"},
                "weights": {"growth_path": 15, "tech_competence": 10},
                "next_question_id": "q3_future_vision"
            },
            {
                "id": "deep_learning",
                "text": {"en": "I can study for years to become an expert", "gu": "હું નિષ્ણાત બનવા માટે વર્ષો સુધી અભ્યાસ કરી શકું છું"},
                "weights": {"dream_path": 20, "ambition": 20, "tech_competence": 20},
                "next_question_id": "q3_future_vision"
            }
        ]
    }
]

def get_questions():
    """Returns the finalized question bank."""
    return QUESTIONS

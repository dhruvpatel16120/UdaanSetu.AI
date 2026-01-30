"""
================================================================================
UdaanSetu.AI - Knowledge Base: Adaptive Intelligence Question Set
================================================================================
Purpose: Defines the dynamic decision tree and weighted scoring logic for
         Module 1 (Assessment Engine).
Version: 4.0.0 (Expanded Set - 35+ Questions)
================================================================================
"""

QUESTIONS = [
    # --- SECTION 1: Educational Foundation ---
    {
        "id": "q1_edu_status",
        "section": "Educational Foundation",
        "type": "single_choice",
        "text": {
            "en": "What is your current educational status?",
            "gu": "આપની વર્તમાન શૈક્ષણિક સ્થિતિ શું છે?"
        },
        "options": [
            {"id": "school", "text": {"en": "In School (9th-12th)", "gu": "શાળામાં (9-12મું)"}, "weights": {"clarity": 10, "ambition": 5}},
            {"id": "college", "text": {"en": "In College / Graduation", "gu": "કોલેજ / ગ્રેજ્યુએશનમાં"}, "weights": {"clarity": 20, "ambition": 15}},
            {"id": "working", "text": {"en": "Looking for Work / Skill Training", "gu": "કામ / કૌશલ્ય તાલીમની શોધમાં"}, "weights": {"confidence": 10, "financial_awareness": 15}}
        ]
    },
    {
        "id": "q_favorite_subject",
        "section": "Educational Foundation",
        "type": "single_choice",
        "text": {
            "en": "Which subject did you enjoy most in school?",
            "gu": "શાળામાં તમને કયો વિષય સૌથી વધુ ગમતો હતો?"
        },
        "options": [
            {"id": "math_sci", "text": {"en": "Mathematics or Science", "gu": "ગણિત અથવા વિજ્ઞાન"}, "weights": {"tech_affinity": 20, "logic": 20}},
            {"id": "lang_soc", "text": {"en": "Languages or Social Studies", "gu": "ભાષાઓ અથવા સામાજિક વિજ્ઞાન"}, "weights": {"communication": 20, "empathy": 10}},
            {"id": "arts_sports", "text": {"en": "Arts, Sports or Craft", "gu": "કલા, રમતગમત અથવા ક્રાફ્ટ"}, "weights": {"creativity": 20, "physical_activity": 20}}
        ]
    },

    # --- SECTION 2: Digital Habits ---
    {
        "id": "q_mobile_usage",
        "section": "Digital Habits",
        "type": "single_choice",
        "text": {
            "en": "How do you spend most of your time on your mobile phone?",
            "gu": "તમે તમારા મોબાઈલ ફોન પર મોટાભાગનો સમય કેવી રીતે પસાર કરો છો?"
        },
        "options": [
            {"id": "entertainment", "text": {"en": "Social Media & Videos", "gu": "સોશિયલ મીડિયા અને વીડિયો"}, "weights": {"digital_awareness": 10}},
            {"id": "learning", "text": {"en": "Learning new things / Courses", "gu": "નવી વસ્તુઓ શીખવી / કોર્સ"}, "weights": {"digital_literacy": 30, "growth_mindset": 20}},
            {"id": "gaming", "text": {"en": "Gaming & Apps", "gu": "ગેમિંગ અને એપ્સ"}, "weights": {"tech_affinity": 20, "logic": 10}}
        ]
    },
    {
        "id": "q_computer_access",
        "section": "Digital Habits",
        "type": "single_choice",
        "text": {
            "en": "Do you have regular access to a computer or laptop?",
            "gu": "શું તમારી પાસે કોમ્પ્યુટર કે લેપટોપની સુવિધા છે?"
        },
        "options": [
            {"id": "personal", "text": {"en": "Yes, I have my own", "gu": "હા, મારી પાસે પોતાનું છે"}, "weights": {"tech_competence": 30, "digital_readiness": 30}},
            {"id": "shared", "text": {"en": "Yes, at school or library", "gu": "હા, શાળામાં અથવા લાઈબ્રેરીમાં"}, "weights": {"digital_readiness": 15}},
            {"id": "none", "text": {"en": "No, only mobile", "gu": "ના, ફક્ત મોબાઈલ"}, "weights": {"needs_support": 20}}
        ]
    },

    # --- SECTION 3: Interest & Hobbies ---
    {
        "id": "q_creative_analytical",
        "section": "Interest",
        "type": "single_choice",
        "text": {
            "en": "Would you rather design a poster or solve a math puzzle?",
            "gu": "શું તમે પોસ્ટર ડિઝાઇન કરવાનું પસંદ કરશો કે ગણિતનો કોયડો ઉકેલવાનું?"
        },
        "options": [
            {"id": "design", "text": {"en": "Design a Poster", "gu": "પોસ્ટર ડિઝાઇન કરવું"}, "weights": {"creativity": 30, "arts": 20}},
            {"id": "solve", "text": {"en": "Solve a Puzzle", "gu": "કોયડો ઉકેલવો"}, "weights": {"logic": 30, "tech_affinity": 10}}
        ]
    },
    {
        "id": "q_outdoor_indoor",
        "section": "Work Style",
        "type": "single_choice",
        "text": {
            "en": "Do you prefer working inside an office or traveling outdoors?",
            "gu": "શું તમે ઓફિસની અંદર કામ કરવાનું પસંદ કરો છો કે બહાર ફરવાનું?"
        },
        "options": [
            {"id": "indoor", "text": {"en": "Inside an Office", "gu": "ઓફિસની અંદર"}, "weights": {"focus": 20, "stability": 10}},
            {"id": "outdoor", "text": {"en": "Outside / Traveling", "gu": "બહાર / મુસાફરી"}, "weights": {"physical_activity": 30, "mobility": 20}}
        ]
    },

    # --- SECTION 4: Soft Skills ---
    {
        "id": "q_teamwork",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {
            "en": "When doing a task, do you prefer working alone or in a group?",
            "gu": "કોઈ કાર્ય કરતી વખતે, તમે એકલા કામ કરવાનું પસંદ કરશો કે જૂથમાં?"
        },
        "options": [
            {"id": "alone", "text": {"en": "Working Alone", "gu": "એકલા કામ કરવું"}, "weights": {"focus": 20, "self_reliance": 20}},
            {"id": "group", "text": {"en": "In a Group", "gu": "જૂથમાં"}, "weights": {"teamwork": 30, "communication": 20}}
        ]
    },
    {
        "id": "q_problem_solving",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {
            "en": "If something stops working, what do you do first?",
            "gu": "જો કોઈ વસ્તુ કામ કરતી બંધ થઈ જાય, તો તમે પહેલા શું કરશો?"
        },
        "options": [
            {"id": "fix_it", "text": {"en": "Try to fix it myself", "gu": "તેને જાતે સુધારવાનો પ્રયત્ન કરીશ"}, "weights": {"problem_solving": 30, "tech_competence": 10}},
            {"id": "ask_help", "text": {"en": "Ask someone for help", "gu": "કોઈની મદદ માંગીશ"}, "weights": {"social_intelligence": 20, "communication": 10}}
        ]
    },

    # --- SECTION 5: Psychology & Mindset ---
    {
        "id": "q_risk_appetite",
        "section": "Psychology",
        "type": "single_choice",
        "text": {
            "en": "What would you prefer for your future?",
            "gu": "ભવિષ્ય માટે તમે શું પસંદ કરશો?"
        },
        "options": [
            {"id": "guaranteed", "text": {"en": "A steady job with fixed income", "gu": "નિશ્ચિત આવકવાળી સ્થિર નોકરી"}, "weights": {"stability": 40, "risk_aversion": 20}},
            {"id": "high_growth", "text": {"en": "High-payout based on performance", "gu": "પરફોર્મન્સ આધારિત ઉચ્ચ આવક"}, "weights": {"ambition": 30, "growth_path": 20}}
        ]
    },
    {
        "id": "q_failure_handling",
        "section": "Mindset",
        "type": "single_choice",
        "text": {
            "en": "How do you feel when you fail at something?",
            "gu": "જ્યારે તમે કોઈ બાબતમાં નિષ્ફળ થાઓ છો ત્યારે તમને કેવું લાગે છે?"
        },
        "options": [
            {"id": "retry", "text": {"en": "I want to try again immediately", "gu": "મારે તરત જ ફરીથી પ્રયત્ન કરવો છે"}, "weights": {"resilience": 40, "determination": 30}},
            {"id": "analyze", "text": {"en": "I stop and think about what went wrong", "gu": "હું રોકાઈને વિચારું છું કે શું ખોટું થયું"}, "weights": {"analytical_thinking": 30, "clarity": 20}}
        ]
    },

    # --- SECTION 6: Family & Background ---
    {
        "id": "q_first_gen",
        "section": "Family Background",
        "type": "single_choice",
        "text": {
            "en": "Are you the first person in your family to go to college?",
            "gu": "શું તમે તમારા પરિવારમાં કોલેજ જનાર પ્રથમ વ્યક્તિ છો?"
        },
        "options": [
            {"id": "yes", "text": {"en": "Yes, I am the first", "gu": "હા, હું પ્રથમ છું"}, "weights": {"ambition": 30, "pioneer_spirit": 20}},
            {"id": "no", "text": {"en": "No, my siblings/parents did too", "gu": "ના, મારા ભાઈ-બહેન/માતા-પિતાએ પણ કર્યું છે"}, "weights": {"guidance_available": 20}}
        ]
    },
    {
        "id": "q_family_income",
        "section": "Family Income",
        "type": "single_choice",
        "text": {
            "en": "What is your approximate family monthly income?",
            "gu": "તમારા પરિવારની અંદાજિત માસિક આવક કેટલી છે?"
        },
        "options": [
            {"id": "low", "text": {"en": "Under 15,000 INR", "gu": "15,000 થી ઓછી"}, "weights": {"financial_need": 30, "scholarship_focus": 20}},
            {"id": "mid", "text": {"en": "15,000 - 50,000 INR", "gu": "15,000 - 50,000"}, "weights": {"stability": 10}},
            {"id": "high", "text": {"en": "Above 50,000 INR", "gu": "50,000 થી વધુ"}, "weights": {"investment_capacity": 20}}
        ]
    },

    # --- SECTION 7: Aptitude ---
    {
        "id": "q_logic_puzzle",
        "section": "Aptitude",
        "type": "single_choice",
        "text": {
            "en": "If all A are B, and all B are C, are all A necessarily C?",
            "gu": "જો બધા A એ B છે, અને બધા B એ C છે, તો શું બધા A પણ C જ હોય?"
        },
        "options": [
            {"id": "yes", "text": {"en": "Yes", "gu": "હા"}, "weights": {"logic": 30, "aptitude": 20}},
            {"id": "no", "text": {"en": "No", "gu": "ના"}, "weights": {"aptitude": 0}},
            {"id": "not_sure", "text": {"en": "Not Sure", "gu": "ખબર નથી"}, "weights": {"aptitude": 5}}
        ]
    },
    {
        "id": "q_mental_math",
        "section": "Aptitude",
        "type": "single_choice",
        "text": {
            "en": "What is 15% of 200?",
            "gu": "200 ના 15% કેટલા થાય?"
        },
        "options": [
            {"id": "20", "text": {"en": "20", "gu": "20"}, "weights": {"numeracy": 0}},
            {"id": "30", "text": {"en": "30", "gu": "30"}, "weights": {"numeracy": 30, "aptitude": 20}},
            {"id": "40", "text": {"en": "40", "gu": "40"}, "weights": {"numeracy": 0}}
        ]
    },

    # --- SECTION 8: Aspirations & Vision ---
    {
        "id": "q_future_vision",
        "section": "Vision",
        "type": "single_choice",
        "text": {
            "en": "Where do you see yourself in 5 years?",
            "gu": "5 વર્ષમાં તમે તમારી જાતને ક્યાં જુઓ છો?"
        },
        "options": [
            {"id": "expert", "text": {"en": "As a skilled expert in a company", "gu": "કંપનીમાં કુશળ નિષ્ણાત તરીકે"}, "weights": {"stability": 20, "growth_path": 20}},
            {"id": "business_owner", "text": {"en": "Running my own small business", "gu": "પોતાનો નાનો વ્યવસાય ચલાવતા"}, "weights": {"ambition": 30, "dream_path": 30}},
            {"id": "govt_job", "text": {"en": "Working in a Government position", "gu": "સરકારી નોકરીમાં"}, "weights": {"security": 30, "stability": 30}}
        ]
    },
    {
        "id": "q_role_model",
        "section": "Vision",
        "type": "single_choice",
        "text": {
            "en": "Who inspires you the most?",
            "gu": "તમને સૌથી વધુ પ્રેરણા કોણ આપે છે?"
        },
        "options": [
            {"id": "tech_leader", "text": {"en": "Tech Visionaries (Elon Musk, etc.)", "gu": "ટેક લીડર્સ (એલોન મસ્ક, વગેરે)"}, "weights": {"tech_affinity": 20, "ambition": 20}},
            {"id": "social_worker", "text": {"en": "Social Workers / Teachers", "gu": "સામાજિક કાર્યકરો / શિક્ષકો"}, "weights": {"empathy": 20, "service": 20}},
            {"id": "business_man", "text": {"en": "Local Successful Businessmen", "gu": "સ્થાનિક સફળ ઉદ્યોગપતિઓ"}, "weights": {"business_sense": 20, "financial_awareness": 20}}
        ]
    },

    # --- ADDING MORE FOR THE 35+ TARGET ---
    {
        "id": "q_learning_speed",
        "section": "Mindset",
        "type": "single_choice",
        "text": {
            "en": "How quickly can you learn a new smartphone app?",
            "gu": "તમે નવી સ્માર્ટફોન એપ કેટલી ઝડપથી શીખી શકો છો?"
        },
        "options": [
            {"id": "instantly", "text": {"en": "Instantly, I love exploring", "gu": "તરત જ, મને એક્સપ્લોર કરવું ગમે છે"}, "weights": {"digital_literacy": 30}},
            {"id": "take_time", "text": {"en": "Takes some time", "gu": "થોડો સમય લાગે છે"}, "weights": {"digital_literacy": 10}},
            {"id": "need_guide", "text": {"en": "I need someone to show me", "gu": "મારે કોઈના માર્ગદર્શનની જરૂર પડે છે"}, "weights": {"needs_support": 10}}
        ]
    },
    {
        "id": "q_helping_others",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {
            "en": "Do you like teaching others what you know?",
            "gu": "શું તમને તમે જે જાણો છો તે બીજાને શીખવવું ગમે છે?"
        },
        "options": [
            {"id": "yes_always", "text": {"en": "Yes, I enjoy explaining things", "gu": "હા, મને વસ્તુઓ સમજાવવી ગમે છે"}, "weights": {"communication": 20, "leadership": 10}},
            {"id": "sometimes", "text": {"en": "Only if they ask", "gu": "ફક્ત જો તેઓ પૂછે તો"}, "weights": {"communication": 10}},
            {"id": "prefer_not", "text": {"en": "No, I prefer my own work", "gu": "ના, મને મારું કામ વધુ ગમે છે"}, "weights": {"focus": 10}}
        ]
    },
    {
        "id": "q_city_vs_village",
        "section": "Mobility",
        "type": "single_choice",
        "text": {
            "en": "Are you willing to move to a big city for a better job?",
            "gu": "શું તમે સારી નોકરી માટે મોટા શહેરમાં જવા તૈયાર છો?"
        },
        "options": [
            {"id": "yes_ready", "text": {"en": "Yes, I am ready to move", "gu": "હા, હું જવા માટે તૈયાર છું"}, "weights": {"mobility": 30, "ambition": 20}},
            {"id": "no_stay", "text": {"en": "No, I want to stay near my family", "gu": "ના, મારે મારા પરિવાર પાસે રહેવું છે"}, "weights": {"local_focus": 30}},
            {"id": "maybe", "text": {"en": "Maybe, depending on the pay", "gu": "કદાચ, પગાર પર આધારિત છે"}, "weights": {"financial_awareness": 20}}
        ]
    },
    {
        "id": "q_drawing_preference",
        "section": "Hobbies",
        "type": "single_choice",
        "text": {
            "en": "How do you like to express your ideas?",
            "gu": "તમે તમારા વિચારો કેવી રીતે વ્યક્ત કરવાનું પસંદ કરો છો?"
        },
        "options": [
            {"id": "drawing", "text": {"en": "Drawing or Sketching", "gu": "ચિત્રકામ કે સ્કેચિંગ"}, "weights": {"creativity": 30}},
            {"id": "writing", "text": {"en": "Writing or Blogging", "gu": "લખાણ કે બ્લોગિંગ"}, "weights": {"communication": 30}},
            {"id": "speaking", "text": {"en": "Speaking or Debating", "gu": "બોલીને કે ચર્ચા કરીને"}, "weights": {"confidence": 30}}
        ]
    },
    {
        "id": "q_machine_interest",
        "section": "Digital Skills",
        "type": "single_choice",
        "text": {
            "en": "Does opening a machine to see how it works sound exciting?",
            "gu": "શું મશીન ખોલીને તે કેવી રીતે કામ કરે છે તે જોવામાં તમને ઉત્સાહ લાગે છે?"
        },
        "options": [
            {"id": "very", "text": {"en": "Very exciting!", "gu": "ખૂબ જ ઉત્સાહિત!"}, "weights": {"tech_affinity": 30, "curiosity": 20}},
            {"id": "little", "text": {"en": "A little bit", "gu": "થોડુંક"}, "weights": {"tech_affinity": 10}},
            {"id": "no", "text": {"en": "Not at all", "gu": "બિલકુલ નહીં"}, "weights": {"social_focus": 20}}
        ]
    },
    {
        "id": "q_public_speaking",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {
            "en": "How do you feel about speaking in front of a class?",
            "gu": "વર્ગની સામે બોલવામાં તમને કેવું લાગે છે?"
        },
        "options": [
            {"id": "fearless", "text": {"en": "I am fearless", "gu": "હું નીડર છું"}, "weights": {"confidence": 30, "leadership": 10}},
            {"id": "nervous", "text": {"en": "A bit nervous but I can do it", "gu": "થોડો ગભરાટ થાય પણ હું કરી શકું છું"}, "weights": {"growth_potential": 20}},
            {"id": "scared", "text": {"en": "I avoid it as much as possible", "gu": "હું બને એટલું ટાળું છું"}, "weights": {"focus": 10}}
        ]
    },
    {
        "id": "q_reading_habits",
        "section": "Self Reflection",
        "type": "single_choice",
        "text": {
            "en": "Do you enjoy reading books or news daily?",
            "gu": "શું તમને દરરોજ પુસ્તકો કે સમાચાર વાંચવા ગમે છે?"
        },
        "options": [
            {"id": "daily", "text": {"en": "Yes, daily", "gu": "હા, દરરોજ"}, "weights": {"knowledge_drive": 30}},
            {"id": "weekly", "text": {"en": "Sometimes a week", "gu": "ક્યારેક અઠવાડિયે"}, "weights": {"knowledge_drive": 10}},
            {"id": "rarely", "text": {"en": "Rarely", "gu": "ભાગ્યે જ"}, "weights": {"action_focus": 10}}
        ]
    },
    {
        "id": "q_organizing_events",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {
            "en": "Are you usually the one who organizes festivals or events in your area?",
            "gu": "શું તમે સામાન્ય રીતે તમારા વિસ્તારમાં તહેવારો કે કાર્યક્રમોનું આયોજન કરો છો?"
        },
        "options": [
            {"id": "always", "text": {"en": "Yes, I lead it", "gu": "હા, હું નેતૃત્વ કરું છું"}, "weights": {"leadership": 30, "organization": 30}},
            {"id": "helping", "text": {"en": "I help others organize", "gu": "હું આયોજનમાં મદદ કરું છું"}, "weights": {"teamwork": 20}},
            {"id": "spectator", "text": {"en": "I just attend and enjoy", "gu": "હું ફક્ત હાજરી આપું છું અને માણીશ"}, "weights": {"stability": 10}}
        ]
    },
    {
        "id": "q_money_management",
        "section": "Expectations",
        "type": "single_choice",
        "text": {
            "en": "Do you keep track of your daily expenses?",
            "gu": "શું તમે તમારા દૈનિક ખર્ચનો હિસાબ રાખો છો?"
        },
        "options": [
            {"id": "strictly", "text": {"en": "Yes, strictly", "gu": "હા, ચોકસાઈથી"}, "weights": {"financial_awareness": 30, "discipline": 20}},
            {"id": "roughly", "text": {"en": "Roughly in my head", "gu": "અંદાજિત રીતે"}, "weights": {"financial_awareness": 10}},
            {"id": "no", "text": {"en": "No, I just spend", "gu": "ના, હું ફક્ત ખર્ચ કરું છું"}, "weights": {"freedom_drive": 10}}
        ]
    },
    {
        "id": "q_nature_lover",
        "section": "Work Style",
        "type": "single_choice",
        "text": {
            "en": "Would you like a job that involves working in nature/farms?",
            "gu": "શું તમે પ્રકૃતિ / ખેતરોમાં કામ કરવા માંગો છો?"
        },
        "options": [
            {"id": "love", "text": {"en": "I love nature", "gu": "મને પ્રકૃતિ ગમે છે"}, "weights": {"agri_interest": 30, "outdoor": 20}},
            {"id": "tech_only", "text": {"en": "Prefer high-tech cities", "gu": "હાઇ-ટેક શહેરો વધુ ગમે"}, "weights": {"tech_affinity": 30, "urban_focus": 20}}
        ]
    },
    {
        "id": "q_helping_animals",
        "section": "Psychology",
        "type": "single_choice",
        "text": {
            "en": "How do you feel when you see an injured animal?",
            "gu": "જ્યારે તમે કોઈ ઘાયલ પ્રાણીને જુઓ છો ત્યારે તમને કેવું લાગે છે?"
        },
        "options": [
            {"id": "help", "text": {"en": "Must help immediately", "gu": "તરત જ મદદ કરવી જોઈએ"}, "weights": {"empathy": 40, "care_giving": 30}},
            {"id": "inform", "text": {"en": "Inform someone who can help", "gu": "કોઈને જાણ કરીશ જે મદદ કરી શકે"}, "weights": {"efficiency": 20}}
        ]
    },
    {
        "id": "q_future_technology",
        "section": "Mindset",
        "type": "single_choice",
        "text": {
            "en": "Does Artificial Intelligence (AI) scare you or excite you?",
            "gu": "શું આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI) તમને ડર પમાડે છે કે ઉત્સાહિત કરે છે?"
        },
        "options": [
            {"id": "excite", "text": {"en": "Very exciting future!", "gu": "ખૂબ જ ઉત્સાહિત ભવિષ્ય!"}, "weights": {"digital_readiness": 30, "tech_affinity": 20}},
            {"id": "scare", "text": {"en": "I am a bit worried", "gu": "મને થોડી ચિંતા છે"}, "weights": {"caution": 20}}
        ]
    },
    {
        "id": "q_hobbies_craft",
        "section": "Hobbies",
        "type": "single_choice",
        "text": {
            "en": "Do you like making things by hand (Pottery, Sewing, etc.)?",
            "gu": "શું તમને હાથેથી વસ્તુઓ બનાવવી ગમે છે (માટીકામ, સિલાઈ, વગેરે)?"
        },
        "options": [
            {"id": "yes", "text": {"en": "Yes, I enjoy handcraft", "gu": "હા, મને હસ્તકલા ગમે છે"}, "weights": {"dexterity": 30, "creativity": 20}},
            {"id": "no", "text": {"en": "No, I prefer digital work", "gu": "ના, મને ડિજિટલ કામ વધુ ગમે છે"}, "weights": {"tech_affinity": 20}}
        ]
    },
    {
        "id": "q_learning_from_videos",
        "section": "Digital Habits",
        "type": "single_choice",
        "text": {
            "en": "Can you learn a new skill just by watching YouTube?",
            "gu": "શું તમે ફક્ત YouTube જોઈને નવું કૌશલ્ય શીખી શકો છો?"
        },
        "options": [
            {"id": "easy", "text": {"en": "Yes, very easily", "gu": "હા, ખૂબ જ સરળતાથી"}, "weights": {"self_learning": 30, "digital_literacy": 20}},
            {"id": "need_practice", "text": {"en": "Only with lots of practice", "gu": "ફક્ત પુષ્કળ પ્રેક્ટિસ સાથે"}, "weights": {"discipline": 20}},
            {"id": "impossible", "text": {"en": "No, I need a teacher", "gu": "ના, મારે શિક્ષકની જરૂર છે"}, "weights": {"academic_focus": 20}}
        ]
    },
    {
        "id": "q_social_media_influence",
        "section": "Digital Habits",
        "type": "single_choice",
        "text": {
            "en": "Do you want to become a Social Media Content Creator?",
            "gu": "શું તમે સોશિયલ મીડિયા કન્ટેન્ટ ક્રિએટર બનવા માંગો છો?"
        },
        "options": [
            {"id": "yes_dream", "text": {"en": "Yes, it is my dream", "gu": "હા, તે મારું સપનું છે"}, "weights": {"digital_creation": 30, "confidence": 20}},
            {"id": "maybe", "text": {"en": "Maybe for fun", "gu": "કદાચ મનોરંજન માટે"}, "weights": {"digital_awareness": 10}},
            {"id": "no", "text": {"en": "No, not interested", "gu": "ના, રસ નથી"}, "weights": {"privacy_focus": 20}}
        ]
    },
    {
        "id": "q_time_management",
        "section": "Self Reflection",
        "type": "single_choice",
        "text": {
            "en": "How do you plan your day?",
            "gu": "તમે તમારા દિવસનું આયોજન કેવી રીતે કરો છો?"
        },
        "options": [
            {"id": "to_do_list", "text": {"en": "I make a to-do list", "gu": "હું ટૂ-ડૂ લિસ્ટ બનાવું છું"}, "weights": {"organization": 30, "discipline": 20}},
            {"id": "spontaneous", "text": {"en": "I go with the flow", "gu": "હું પ્રવાહ સાથે જાઉં છું"}, "weights": {"flexibility": 30, "creativity": 10}}
        ]
    },
    {
        "id": "q_handling_pressure",
        "section": "Psychology",
        "type": "single_choice",
        "text": {
            "en": "How do you work under tight deadlines?",
            "gu": "તમે સમયમર્યાદાના દબાણ હેઠળ કેવી રીતે કામ કરો છો?"
        },
        "options": [
            {"id": "stay_calm", "text": {"en": "I stay calm and focused", "gu": "હું શાંત અને ધ્યાન કેન્દ્રિત રાખું છું"}, "weights": {"stress_management": 30, "stability": 20}},
            {"id": "hurry", "text": {"en": "I work faster but get stressed", "gu": "હું ઝડપથી કામ કરું છું પણ તણાવમાં આવી જાઉં છું"}, "weights": {"efficiency": 20}}
        ]
    },
    {
        "id": "q_ideal_work_env",
        "section": "Work Style",
        "type": "single_choice",
        "text": {
            "en": "What is your ideal work environment?",
            "gu": "તમારા માટે આદર્શ કાર્ય વાતાવરણ શું છે?"
        },
        "options": [
            {"id": "quiet", "text": {"en": "Quiet, library-like", "gu": "શાંત, લાઈબ્રેરી જેવું"}, "weights": {"focus": 30}},
            {"id": "buzzy", "text": {"en": "Lively, noisy office", "gu": "જીવંત, ગુંજતી ઓફિસ"}, "weights": {"social_intelligence": 20}},
            {"id": "home", "text": {"en": "Work from Home / Flexible", "gu": "ઘરથી કામ / લવચીક"}, "weights": {"digital_readiness": 30}}
        ]
    },
    {
        "id": "q_curiosity_level",
        "section": "Mindset",
        "type": "single_choice",
        "text": {
            "en": "Do you often ask 'Why' things happen the way they do?",
            "gu": "શું તમે અવારનવાર પૂછો છો કે વસ્તુઓ આ રીતે 'કેમ' થાય છે?"
        },
        "options": [
            {"id": "constantly", "text": {"en": "Constantly", "gu": "સતત"}, "weights": {"curiosity": 30, "research_drive": 20}},
            {"id": "sometimes", "text": {"en": "Sometimes", "gu": "ક્યારેક"}, "weights": {"curiosity": 10}},
            {"id": "seldom", "text": {"en": "Seldom", "gu": "ભાગ્યે જ"}, "weights": {"practicality": 20}}
        ]
    }
]

def get_questions():
    """Returns the finalized question bank."""
    return QUESTIONS

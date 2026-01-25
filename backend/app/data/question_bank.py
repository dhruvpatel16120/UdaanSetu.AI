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
        "options": [],
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
        "text": {"en": "District", "gu": "જિલ્લો"},
        "options": [],
        "next_question_id": "q1_edu_level"
    },

    # --- 15 DYNAMIC ASSESSMENT QUESTIONS ---

    # 1. Education
    {
        "id": "q1_edu_level",
        "section": "Education",
        "type": "single_choice",
        "text": {
            "en": "What is your current education level?",
            "gu": "તમારું વર્તમાન શિક્ષણ સ્તર શું છે?"
        },
        "options": [
            {"id": "below_10", "text": {"en": "Class 8-10", "gu": "ધોરણ 8-10"}, "traits": {"education": "school"}},
            {"id": "11_12", "text": {"en": "Class 11-12", "gu": "ધોરણ 11-12"}, "traits": {"education": "high_school"}},
            {"id": "diploma", "text": {"en": "Diploma / ITI", "gu": "ડિપ્લોમા / આઈટીઆઈ"}, "traits": {"education": "vocational"}},
            {"id": "graduate", "text": {"en": "Graduate / Pursuing Degree", "gu": "સ્નાતક / ડિગ્રી"}, "traits": {"education": "degree"}},
            {"id": "dropout", "text": {"en": "Dropout", "gu": "અભ્યાસ છોડી દીધો"}, "traits": {"education": "dropout"}}
        ]
    },

    # 2. Past Grades (Education)
    {
        "id": "q2_grades",
        "section": "Education",
        "type": "single_choice",
        "text": {
            "en": "How were your academic grades in the last major exam?",
            "gu": "તમારી છેલ્લી પરીક્ષામાં તમારા શૈક્ષણિક ગ્રેડ કેવા હતા?"
        },
        "options": [
            {"id": "top_tier", "text": {"en": "Excellent (Above 80%)", "gu": "શ્રેષ્ઠ (80% થી વધુ)"}, "traits": {"academic_performance": "high"}},
            {"id": "mid_tier", "text": {"en": "Good (60% - 80%)", "gu": "સારું (60% - 80%)"}, "traits": {"academic_performance": "medium"}},
            {"id": "avg_tier", "text": {"en": "Average (40% - 60%)", "gu": "સરેરાશ (40% - 60%)"}, "traits": {"academic_performance": "average"}},
            {"id": "low_tier", "text": {"en": "Below Average (Less than 40%)", "gu": "સરેરાશથી ઓછું (40% થી ઓછું)"}, "traits": {"academic_performance": "low"}}
        ]
    },

    # 3. Family Type (Background)
    {
        "id": "q3_family_type",
        "section": "Family Background",
        "type": "single_choice",
        "text": {
            "en": "What is your family's primary occupation type?",
            "gu": "તમારા પરિવારનો મુખ્ય વ્યવસાય કેવો છે?"
        },
        "options": [
            {"id": "business", "text": {"en": "Business / Entrepreneurship", "gu": "વ્યવસાય / ઉદ્યોગ"}, "traits": {"background_exposure": "business"}},
            {"id": "service", "text": {"en": "Service / Job Class", "gu": "નોકરી / સેવા"}, "traits": {"background_exposure": "service"}},
            {"id": "farming", "text": {"en": "Farming / Agriculture", "gu": "ખેતી / કૃષિ"}, "traits": {"background_exposure": "agriculture"}},
            {"id": "labor", "text": {"en": "Daily Wage / Labor", "gu": "રોજંદાર / શ્રમ"}, "traits": {"background_exposure": "labor"}}
        ]
    },

    # 4. Family Income (Background)
    {
        "id": "q4_income",
        "section": "Family Income",
        "type": "single_choice",
        "text": {
            "en": "What is your family's approximate monthly income?",
            "gu": "તમારા પરિવારની આશરે માસિક આવક કેટલી છે?"
        },
        "options": [
            {"id": "low", "text": {"en": "Below ₹15,000", "gu": "₹15,000 થી ઓછી"}, "traits": {"financial_constraint": "high"}},
            {"id": "mid_low", "text": {"en": "₹15,000 - ₹30,000", "gu": "₹15,000 - ₹30,000"}, "traits": {"financial_constraint": "medium"}},
            {"id": "mid_high", "text": {"en": "₹30,000 - ₹60,000", "gu": "₹30,000 - ₹60,000"}, "traits": {"financial_constraint": "low"}},
            {"id": "high", "text": {"en": "Above ₹60,000", "gu": "₹60,000 થી વધુ"}, "traits": {"financial_constraint": "none"}}
        ]
    },

    # 5. Area of Interest
    {
        "id": "q5_interest",
        "section": "Interest",
        "type": "single_choice",
        "text": {
            "en": "Which field interests you the most?",
            "gu": "તમને કયા ક્ષેત્રમાં સૌથી વધુ રસ છે?"
        },
        "options": [
            {"id": "tech", "text": {"en": "Technology & Computers", "gu": "ટેકનોલોજી અને કોમ્પ્યુટર"}, "traits": {"domain": "tech"}},
            {"id": "science", "text": {"en": "Medical & Science", "gu": "મેડિકલ અને વિજ્ઞાન"}, "traits": {"domain": "science"}},
            {"id": "commerce", "text": {"en": "Business & Finance", "gu": "વ્યવસાય અને ફાયનાન્સ"}, "traits": {"domain": "commerce"}},
            {"id": "arts", "text": {"en": "Arts & Creativity", "gu": "કલા અને સર્જનાત્મકતા"}, "traits": {"domain": "creative"}},
            {"id": "uniform", "text": {"en": "Police / Defense / Public Service", "gu": "પોલીસ / રક્ષણ / જાહેર સેવા"}, "traits": {"domain": "service"}}
        ]
    },

    # 6. Hobbies
    {
        "id": "q6_hobbies",
        "section": "Hobbies",
        "type": "single_choice",
        "text": {
            "en": "What do you like to do in your free time?",
            "gu": "તમને ફુરસદના સમયમાં શું કરવું ગમે છે?"
        },
        "options": [
            {"id": "fixing", "text": {"en": "Fixing things / Mechanics", "gu": "વસ્તુઓ રિપેર કરવી / મિકેનિક્સ"}, "traits": {"hands_on": "high"}},
            {"id": "reading", "text": {"en": "Reading / Learning new things", "gu": "વાંચન / નવું શીખવું"}, "traits": {"intellectual": "high"}},
            {"id": "gaming", "text": {"en": "Mobile Gaming / Computers", "gu": "મોબાઇલ ગેમિંગ / કોમ્પ્યુટર"}, "traits": {"digital_affinity": "high"}},
            {"id": "social", "text": {"en": "Talking to people / Leading groups", "gu": "લોકો સાથે વાત કરવી / નેતૃત્વ"}, "traits": {"social": "high"}},
            {"id": "art", "text": {"en": "Drawing / Designing / Decoration", "gu": "ચિત્રકામ / ડિઝાઇનિંગ"}, "traits": {"artistic": "high"}}
        ]
    },

    # 7. Psychology (Mindset - Games)
    {
        "id": "q7_mindset_games",
        "section": "Mindset",
        "type": "single_choice",
        "text": {
            "en": "When it comes to mobile games or apps, what interests you more?",
            "gu": "મોબાઇલ ગેમ્સ કે એપ્સની વાત આવે ત્યારે તમને શું વધુ ગમે છે?"
        },
        "options": [
            {"id": "consumer", "text": {"en": "Just playing and enjoying the game", "gu": "માત્ર રમવું અને આનંદ લેવો"}, "traits": {"curiosity_type": "consumer"}},
            {"id": "creator", "text": {"en": "Curious about how it was built or designed", "gu": "તે કેવી રીતે બની હશે તેની જિજ્ઞાસા"}, "traits": {"curiosity_type": "creator"}},
            {"id": "strategist", "text": {"en": "Finding winning strategies and loop holes", "gu": "જીતવાની રીતો અને યુક્તિઓ શોધવી"}, "traits": {"curiosity_type": "strategist"}}
        ]
    },

    # 8. Psychology (Risk / Work Style)
    {
        "id": "q8_work_style",
        "section": "Mindset",
        "type": "single_choice",
        "text": {
            "en": "Which work environment appeals to you more?",
            "gu": "તમને કેવું કામ કરવાનું વધુ ગમશે?"
        },
        "options": [
            {"id": "stable", "text": {"en": "Stable income, fixed hours (Peace of mind)", "gu": "સ્થિર આવક, નિશ્ચિત સમય (શાંતિ)"}, "traits": {"risk_appetite": "low"}},
            {"id": "growth", "text": {"en": "High growth, competitive, variable income", "gu": "ઝડપી વૃદ્ધિ, સ્પર્ધાત્મક, અનિશ્ચિત આવક"}, "traits": {"risk_appetite": "high"}},
            {"id": "freedom", "text": {"en": "Working on my own terms (Independence)", "gu": "મારી પોતાની શરતો પર કામ કરવું (સ્વતંત્રતા)"}, "traits": {"risk_appetite": "entrepreneur"}}
        ]
    },

    # 9. Vision (Long Term)
    {
        "id": "q9_vision",
        "section": "Vision",
        "type": "single_choice",
        "text": {
            "en": "Where do you see yourself in 5 years?",
            "gu": "5 વર્ષ પછી તમે તમારી જાતને ક્યાં જુઓ છો?"
        },
        "options": [
            {"id": "expert", "text": {"en": "As a top expert in a specific skill", "gu": "કોઈ ચોક્કસ કૌશલ્યના નિષ્ણાત તરીકે"}, "traits": {"ambition": "skill_focused"}},
            {"id": "boss", "text": {"en": "Running my own big business", "gu": "પોતાનો મોટો વ્યવસાય ચલાવતો"}, "traits": {"ambition": "business_focused"}},
            {"id": "secure", "text": {"en": "In a secure government or bank job", "gu": "સુરક્ષિત સરકારી કે બેંક નોકરીમાં"}, "traits": {"ambition": "security_focused"}},
            {"id": "social", "text": {"en": "Helping my community / village", "gu": "મારા સમાજ / ગામની સેવા કરતો"}, "traits": {"ambition": "social_focused"}}
        ]
    },

    # 10. Expected Income
    {
        "id": "q10_income_exp",
        "section": "Vision",
        "type": "single_choice",
        "text": {
            "en": "What is your expected monthly income after 2-3 years of working?",
            "gu": "2-3 વર્ષ કામ કર્યા પછી તમારી અપેક્ષિત માસિક આવક કેટલી છે?"
        },
        "options": [
            {"id": "start", "text": {"en": "₹20,000 - ₹30,000 is enough to start", "gu": "₹20,000 - ₹30,000 શરૂઆત માટે પૂરતા છે"}, "traits": {"money_motivation": "moderate"}},
            {"id": "growth", "text": {"en": "₹50,000+, I want good growth", "gu": "₹50,000+, મને સારી વૃદ્ધિ જોઈએ છે"}, "traits": {"money_motivation": "high"}},
            {"id": "ambitious", "text": {"en": "₹1 Lakh+, I am very ambitious", "gu": "₹1 લાખ+, હું ખૂબ મહત્વકાંક્ષી છું"}, "traits": {"money_motivation": "very_high"}}
        ]
    },

    # 11. Positive Points (Strengths)
    {
        "id": "q11_strengths",
        "section": "Self Reflection",
        "type": "single_choice",
        "text": {
            "en": "What do you consider your biggest strength?",
            "gu": "તમે તમારી સૌથી મોટી શક્તિ કોને માનો છો?"
        },
        "options": [
            {"id": "hardwork", "text": {"en": "I can work hard for long hours without getting tired", "gu": "હું થાક્યા વગર લાંબા સમય સુધી મહેનત કરી શકું છું"}, "traits": {"strength": "stamina"}},
            {"id": "logic", "text": {"en": "I can solve problems and think logically", "gu": "હું સમસ્યાઓ ઉકેલી શકું છું અને તાર્કિક વિચારી શકું છું"}, "traits": {"strength": "logic"}},
            {"id": "people", "text": {"en": "I am good at convincing and talking to people", "gu": "હું લોકોને સમજાવવામાં અને વાત કરવામાં સારો છું"}, "traits": {"strength": "communication"}},
            {"id": "creative", "text": {"en": "I have new ideas and imagination", "gu": "મારી પાસે નવા વિચારો અને કલ્પનાશક્તિ છે"}, "traits": {"strength": "creativity"}}
        ]
    },

    # 12. Negative Points (Weaknesses)
    {
        "id": "q12_weakness",
        "section": "Self Reflection",
        "type": "single_choice",
        "text": {
            "en": "What is one area you struggle with?",
            "gu": "તમને કઈ બાબતમાં મુશ્કેલી પડે છે?"
        },
        "options": [
            {"id": "focus", "text": {"en": "I get distracted easily", "gu": "મારું ધ્યાન જલ્દી ભટકી જાય છે"}, "traits": {"weakness": "focus"}},
            {"id": "confidence", "text": {"en": "I feel shy or nervous in crowds", "gu": "મને ભીડમાં શરમ કે ગભરાટ થાય છે"}, "traits": {"weakness": "confidence"}},
            {"id": "technical", "text": {"en": "I find math/technology difficult", "gu": "મને ગણિત/ટેકનોલોજી અઘરું લાગે છે"}, "traits": {"weakness": "technical"}},
            {"id": "patience", "text": {"en": "I want quick results, I lack patience", "gu": "મને ઝડપી પરિણામ જોઈએ છે, ધીરજ નથી"}, "traits": {"weakness": "patience"}}
        ]
    },

    # 13. Relocation (Mobility)
    {
        "id": "q13_relocation",
        "section": "Mobility",
        "type": "single_choice",
        "text": {
            "en": "If a good job requires you to move to a big city (like Mumbai or Bangalore), would you go?",
            "gu": "જો સારી નોકરી માટે મોટા શહેરમાં (જેમ કે મુંબઈ કે બેંગ્લોર) જવું પડે, તો તમે જશો?"
        },
        "options": [
            {"id": "yes_anywhere", "text": {"en": "Yes, anywhere for my career", "gu": "હા, કારકિર્દી માટે ક્યાંય પણ"}, "traits": {"mobility": "high"}},
            {"id": "yes_gujarat", "text": {"en": "Yes, but only within Gujarat", "gu": "હા, પણ માત્ર ગુજરાતમાં જ"}, "traits": {"mobility": "medium"}},
            {"id": "no_home", "text": {"en": "No, I want to stay near my home/village", "gu": "ના, મારે મારા ઘર/ગામ નજીક રહેવું છે"}, "traits": {"mobility": "low"}}
        ]
    },

    # 14. Mindset (Business vs Job vs Billionaire)
    {
        "id": "q14_billionaire_mind",
        "section": "Factor: Mindset",
        "type": "single_choice",
        "text": {
            "en": "How do you view failure?",
            "gu": "તમે નિષ્ફળતાને કેવી રીતે જુઓ છો?"
        },
        "options": [
            {"id": "safe", "text": {"en": "Failure is bad, I avoid risks to stay safe", "gu": "નિષ્ફળતા ખરાબ છે, હું સુરક્ષિત રહેવા જોખમ ટાળું છું"}, "traits": {"mindset": "employee"}},
            {"id": "learning", "text": {"en": "Failure is part of learning, I will try again", "gu": "નિષ્ફળતા શીખવાનો ભાગ છે, હું ફરી પ્રયત્ન કરીશ"}, "traits": {"mindset": "growth"}},
            {"id": "challenge", "text": {"en": "I love high stakes. Big risk = Big reward (Billionaire Mindset)", "gu": "મને મોટા પડકારો ગમે છે. મોટું જોખમ = મોટું ઇનામ"}, "traits": {"mindset": "billionaire"}}
        ]
    },
    
    # 16. Financial Attitude (Mindset)
    {
        "id": "q16_money_mindset",
        "section": "Factor: Mindset",
        "type": "single_choice",
        "text": {
            "en": "If you had ₹10,000 extra, what would you do?",
            "gu": "જો તમારી પાસે ₹10,000 વધારાના હોય, તો તમે શું કરશો?"
        },
        "options": [
            {"id": "save", "text": {"en": "Save it in the bank for safety", "gu": "સુરક્ષા માટે બેંકમાં જમા કરીશ"}, "traits": {"financial_attitude": "saver"}},
            {"id": "spend", "text": {"en": "Buy something I need or want", "gu": "મને જોઈતી કોઈ વસ્તુ ખરીદીશ"}, "traits": {"financial_attitude": "consumer"}},
            {"id": "invest", "text": {"en": "Start a small business or invest to grow it", "gu": "નાનો ધંધો શરૂ કરીશ અથવા તેને વધારવા રોકાણ કરીશ"}, "traits": {"financial_attitude": "investor"}}
        ]
    },

    # 17. Leadership
    {
        "id": "q17_leadership",
        "section": "Factor: Leadership",
        "type": "single_choice",
        "text": {
            "en": "In a group project or team game, what role do you take?",
            "gu": "જ્યારે તમે કોઈ જૂથમાં કામ કરો છો, ત્યારે તમારી ભૂમિકા શું હોય છે?"
        },
        "options": [
            {"id": "leader", "text": {"en": "I lead and give instructions", "gu": "હું નેતૃત્વ લઉં છું અને સૂચના આપું છું"}, "traits": {"leadership": "high"}},
            {"id": "supporter", "text": {"en": "I help others and follow the plan", "gu": "હું મદદ કરું છું અને યોજનાનું પાલન કરું છું"}, "traits": {"leadership": "supportive"}},
            {"id": "solo", "text": {"en": "I prefer to work alone", "gu": "મને એકલા કામ કરવું ગમે છે"}, "traits": {"leadership": "independent"}}
        ]
    },

    # 18. Technology Comfort
    {
        "id": "q18_tech",
        "section": "Factor: Skills",
        "type": "single_choice",
        "text": {
            "en": "How comfortable are you with computers and smartphones?",
            "gu": "તમે કમ્પ્યુટર અને સ્માર્ટફોન સાથે કેટલા અનુકૂળ છો?"
        },
        "options": [
            {"id": "expert", "text": {"en": "I can fix problems and install apps easily", "gu": "હું સમસ્યાઓ ઉકેલી શકું છું અને એપ્સ ઇન્સ્ટોલ કરી શકું છું"}, "traits": {"digital_literacy": "high"}},
            {"id": "basic", "text": {"en": "I can use basic apps like WhatsApp and YouTube", "gu": "હું વોટ્સએપ અને યુટ્યુબ જેવી બેઝિક એપ્સ વાપરી શકું છું"}, "traits": {"digital_literacy": "basic"}},
            {"id": "low", "text": {"en": "I need help using new technology", "gu": "નવી ટેકનોલોજી વાપરવા માટે મને મદદની જરૂર પડે છે"}, "traits": {"digital_literacy": "low"}}
        ]
    },

    # 19. Problem Solving (Logic)
    {
        "id": "q19_problem_solving",
        "section": "Factor: Logic",
        "type": "single_choice",
        "text": {
            "en": "How do you solve a difficult problem?",
            "gu": "તમે કોઈ મુશ્કેલ સમસ્યા કેવી રીતે ઉકેલો છો?"
        },
        "options": [
            {"id": "ask", "text": {"en": "I ask someone elder or expert immediately", "gu": "હું તરત જ કોઈ વડીલ કે નિષ્ણાતને પૂછું છું"}, "traits": {"problem_solving": "dependent"}},
            {"id": "research", "text": {"en": "I search online or think about different solutions", "gu": "હું ઓનલાઇન શોધું છું અથવા અલગ ઉકેલો વિચારું છું"}, "traits": {"problem_solving": "research_oriented"}},
            {"id": "trial", "text": {"en": "I keep trying until it works", "gu": "હું સફળ ન થાઉં ત્યાં સુધી પ્રયત્ન કરું છું"}, "traits": {"problem_solving": "persistent"}}
        ]
    },

    # 20. Learning Preference
    {
        "id": "q20_learning",
        "section": "Education",
        "type": "single_choice",
        "text": {
            "en": "How do you learn best?",
            "gu": "તમે સૌથી સારી રીતે કેવી રીતે શીખો છો?"
        },
        "options": [
            {"id": "video", "text": {"en": "By watching videos or demonstrations", "gu": "વિડિઓ જોઈને કે પ્રેક્ટિકલ જોઈને"}, "traits": {"learning_style": "visual"}},
            {"id": "reading", "text": {"en": "By reading books or articles", "gu": "પુસ્તકો કે લેખો વાંચીને"}, "traits": {"learning_style": "textual"}},
            {"id": "doing", "text": {"en": "By doing it myself (Hands-on)", "gu": "જાતે કરીને (પ્રેક્ટિકલ)"}, "traits": {"learning_style": "kinesthetic"}}
        ]
    }
]

def get_questions():
    return INITIAL_QUESTIONS

export const STATIC_QUESTIONS = [
    {
        "id": "q1_edu_level",
        "section": "Education",
        "type": "single_choice",
        "text": {"en": "What is your current education level?", "gu": "તમારું વર્તમાન શિક્ષણ સ્તર શું છે?"},
        "options": [
            {"id": "no_schooling", "text": {"en": "No Formal Schooling", "gu": "કોઈ ઔપચારિક શિક્ષણ નથી"}, "traits": {"edu": "none"}},
            {"id": "elementary", "text": {"en": "Primary Schooling (Class 1-7)", "gu": "પ્રાથમિક શિક્ષણ (ધોરણ 1-7)"}, "traits": {"edu": "primary"}},
            {"id": "school", "text": {"en": "High School (Class 8-10)", "gu": "માધ્યમિક શિક્ષણ (ધોરણ 8-10)"}, "traits": {"edu": "secondary"}},
            {"id": "high_school", "text": {"en": "Higher Secondary (Class 11-12)", "gu": "ઉચ્ચ માધ્યમિક શિક્ષણ (ધોરણ 11-12)"}, "traits": {"edu": "higher_secondary"}},
            {"id": "diploma", "text": {"en": "Diploma / Vocational Training", "gu": "ડિપ્લોમા / વ્યાવસાયિક તાલીમ"}, "traits": {"edu": "diploma"}},
            {"id": "degree", "text": {"en": "Graduate / Bachelor's Degree", "gu": "સ્નાતક પદવી"}, "traits": {"edu": "degree"}},
            {"id": "post_graduate", "text": {"en": "Postgraduate / Master's Degree", "gu": "અનુસ્નાતક પદવી"}, "traits": {"edu": "post_graduate"}},
            {"id": "phd", "text": {"en": "Doctorate / PhD", "gu": "ડોક્ટરેટ / પીએચડી"}, "traits": {"edu": "phd"}}
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
    },
    {
        "id": "q14_social_media",
        "section": "Digital Habits",
        "type": "single_choice",
        "text": {"en": "How do you mainly use social media?", "gu": "તમે મુખ્યત્વે સોશિયલ મીડિયાનો ઉપયોગ કેવી રીતે કરો છો?"},
        "options": [
            {"id": "learning", "text": {"en": "Learning new skills", "gu": "નવી કુશળતા શીખવા માટે"}, "traits": {"digital_intent": "learner"}},
            {"id": "entertainment", "text": {"en": "Entertainment/Chatting", "gu": "મનોરંજન/ગપસપ માટે"}, "traits": {"digital_intent": "consumer"}}
        ]
    },
    {
        "id": "q15_team_role",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {"en": "In a group project, what is your preferred role?", "gu": "ગ્રુપ પ્રોજેક્ટમાં, તમારી પસંદગીની ભૂમિકા શું છે?"},
        "options": [
            {"id": "leader", "text": {"en": "Leading the team", "gu": "ટીમનું નેતૃત્વ કરવું"}, "traits": {"soft_skill": "leadership"}},
            {"id": "executor", "text": {"en": "Completing assigned tasks", "gu": "સોંપાયેલ કાર્યો પૂર્ણ કરવા"}, "traits": {"soft_skill": "execution"}}
        ]
    },
    {
        "id": "q16_tech_access",
        "section": "Digital Skills",
        "type": "single_choice",
        "text": {"en": "Which device do you use most for learning?", "gu": "શીખવા માટે તમે કયા સાધનનો સૌથી વધુ ઉપયોગ કરો છો?"},
        "options": [
            {"id": "smartphone", "text": {"en": "Smartphone", "gu": "સ્માર્ટફોન"}},
            {"id": "laptop", "text": {"en": "Laptop/PC", "gu": "લેપટોપ/પીસી"}},
            {"id": "none", "text": {"en": "None/Public Center", "gu": "કંઈ નહીં/જાહેર કેન્દ્ર"}}
        ]
    },
    {
        "id": "q17_agri_tech",
        "section": "Interest",
        "type": "single_choice",
        "text": {"en": "Are you interested in modernizing farming using technology?", "gu": "શું તમે ટેકનોલોજીનો ઉપયોગ કરીને ખેતીને આધુનિક બનાવવામાં રસ ધરાવો છો?"},
        "options": [
            {"id": "very", "text": {"en": "Very Interested", "gu": "ખૂબ જ રસ છે"}, "traits": {"agri_tech": "high"}},
            {"id": "neutral", "text": {"en": "Maybe", "gu": "કદાચ"}},
            {"id": "no", "text": {"en": "No, other fields", "gu": "ના, અન્ય ક્ષેત્રો"}}
        ]
    },
    {
        "id": "q18_problem_solving",
        "section": "Aptitude",
        "type": "single_choice",
        "text": {"en": "When a machine stops working, what is your first reaction?", "gu": "જ્યારે કોઈ મશીન ચાલતું બંધ થઈ જાય, ત્યારે તમારી પ્રથમ પ્રતિક્રિયા શું હોય છે?"},
        "options": [
            {"id": "repair", "text": {"en": "Try to fix it myself", "gu": "તેને જાતે ઠીક કરવાનો પ્રયાસ કરું છું"}, "traits": {"aptitude": "technical"}},
            {"id": "call_expert", "text": {"en": "Call a professional", "gu": "નિષ્ણાતને બોલાવું છું"}, "traits": {"aptitude": "service"}}
        ]
    },
    {
        "id": "q19_risk_appetite",
        "section": "Mindset",
        "type": "single_choice",
        "text": {"en": "Which career path appeals to you more?", "gu": "તમને કયો કારકિર્દીનો માર્ગ વધુ આકર્ષે છે?"},
        "options": [
            {"id": "stable", "text": {"en": "Stable Government Job", "gu": "સ્થિર સરકારી નોકરી"}, "traits": {"risk": "low"}},
            {"id": "startup", "text": {"en": "Innovative Startup", "gu": "નવું સ્ટાર્ટઅપ"}, "traits": {"risk": "high"}}
        ]
    },
    {
        "id": "q20_comm_pref",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {"en": "How do you prefer to express your ideas?", "gu": "તમે તમારા વિચારોને કેવી રીતે વ્યક્ત કરવાનું પસંદ કરો છો?"},
        "options": [
            {"id": "speaking", "text": {"en": "Speaking/Presenting", "gu": "બોલીને/રજૂઆત કરીને"}},
            {"id": "writing", "text": {"en": "Writing/Documentation", "gu": "લખીને/દસ્તાવેજીકરણ કરીને"}}
        ]
    },
    {
        "id": "q21_learning_style",
        "section": "Education",
        "type": "single_choice",
        "text": {"en": "What is your preferred way of learning?", "gu": "શીખવાની તમારી પસંદગીની રીત કઈ છે?"},
        "options": [
            {"id": "visual", "text": {"en": "Watching Videos", "gu": "વીડિયો જોઈને"}},
            {"id": "reading", "text": {"en": "Reading Books/Articles", "gu": "પુસ્તકો/લેખો વાંચીને"}}
        ]
    },
    {
        "id": "q22_logic_aptitude",
        "section": "Aptitude",
        "type": "single_choice",
        "text": {"en": "Do you enjoy solving math puzzles or logic games?", "gu": "શું તમને ગણિતના કોયડાઓ અથવા તર્કશાસ્ત્રની રમતો ઉકેલવી ગમે છે?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, a lot", "gu": "હા, ખૂબ જ"}, "traits": {"logic": "high"}},
            {"id": "no", "text": {"en": "No, I find them boring", "gu": "ના, મને તે કંટાળાજનક લાગે છે"}}
        ]
    },
    {
        "id": "q23_creative_interest",
        "section": "Interest",
        "type": "single_choice",
        "text": {"en": "Are you interested in design, photography or video editing?", "gu": "શું તમને ડિઝાઇન, ફોટોગ્રાફી અથવા વિડિયો એડિટિંગમાં રસ છે?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, Interested", "gu": "હા, રસ છે"}, "traits": {"creative": "high"}},
            {"id": "no", "text": {"en": "No, not really", "gu": "ના, બહુ નહીં"}}
        ]
    },
    {
        "id": "q24_impact",
        "section": "Values",
        "type": "single_choice",
        "text": {"en": "What motivates you more for a job?", "gu": "નોકરી માટે તમને શું વધુ પ્રોત્સાહિત કરે છે?"},
        "options": [
            {"id": "money", "text": {"en": "High Salary", "gu": "ઊંચો પગાર"}},
            {"id": "social", "text": {"en": "Helping my community", "gu": "મારા સમાજને મદદ કરવી"}}
        ]
    },
    {
        "id": "q25_internet",
        "section": "Digital Skills",
        "type": "single_choice",
        "text": {"en": "How would you describe your internet usage skill?", "gu": "તમે તમારી ઇન્ટરનેટ ઉપયોગ કરવાની કુશળતાનું વર્ણન કેવી રીતે કરશો?"},
        "options": [
            {"id": "expert", "text": {"en": "I can find anything online", "gu": "હું ઓનલાઇન કંઈપણ શોધી શકું છું"}},
            {"id": "beginner", "text": {"en": "Only basic apps (WA/FB)", "gu": "માત્ર મૂળભૂત એપ્સ (WA/FB)"}}
        ]
    },
    {
        "id": "q26_environment",
        "section": "Work Style",
        "type": "single_choice",
        "text": {"en": "Where would you prefer to work?", "gu": "તમે ક્યાં કામ કરવાનું પસંદ કરશો?"},
        "options": [
            {"id": "indoor", "text": {"en": "Indoor/Office environment", "gu": "ઇન્ડોર/ઓફિસ વાતાવરણ"}},
            {"id": "outdoor", "text": {"en": "Outdoor/Field work", "gu": "આઉટડોર/ફિલ્ડ વર્ક"}}
        ]
    },
    {
        "id": "q27_online_courses",
        "section": "Digital Habits",
        "type": "single_choice",
        "text": {"en": "Have you ever taken an online course or watched a tutorial to learn a skill?", "gu": "શું તમે ક્યારેય કોઈ કૌશલ્ય શીખવા માટે ઓનલાઇન કોર્સ લીધો છે અથવા ટ્યુટોરીયલ જોયું છે?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, many times", "gu": "હા, ઘણી વખત"}},
            {"id": "no", "text": {"en": "Never", "gu": "ક્યારેય નહીં"}}
        ]
    },
    {
        "id": "q28_english_comfort",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {"en": "How comfortable are you with communicating in English?", "gu": "તમે અંગ્રેજીમાં વાતચીત કરવામાં કેટલા આરામદાયક છો?"},
        "options": [
            {"id": "fluent", "text": {"en": "Confident", "gu": "આત્મવિશ્વાસ"}, "traits": {"english": "high"}},
            {"id": "learning", "text": {"en": "Working on it", "gu": "હજુ શીખી રહ્યો છું"}, "traits": {"english": "learning"}}
        ]
    },
    {
        "id": "q29_career_stability",
        "section": "Mindset",
        "type": "single_choice",
        "text": {"en": "Do you prefer a job that stays the same for years?", "gu": "શું તમે એવી નોકરી પસંદ કરો છો જે વર્ષો સુધી સમાન રહે?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, stability is key", "gu": "હા, સ્થિરતા મુખ્ય છે"}},
            {"id": "no", "text": {"en": "No, I want constant change", "gu": "ના, મારે સતત ફેરફાર જોઈએ છે"}}
        ]
    },
    {
        "id": "q30_entrepreneur",
        "section": "Mindset",
        "type": "single_choice",
        "text": {"en": "Have you ever tried to sell something or start a small business?", "gu": "શું તમે ક્યારેય કંઈપણ વેચવાનો અથવા નાનો વ્યવસાય શરૂ કરવાનો પ્રયાસ કર્યો છે?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, once or more", "gu": "હા, એકવાર અથવા વધુ વખત"}, "traits": {"spirit": "entrepreneur"}},
            {"id": "no", "text": {"en": "Never thought about it", "gu": "ક્યારેય એ વિશે વિચાર્યું નથી"}}
        ]
    },
    {
        "id": "q31_public_speaking",
        "section": "Soft Skills",
        "type": "single_choice",
        "text": {"en": "How do you feel about speaking in front of many people?", "gu": "ઘણા લોકો સામે બોલવા વિશે તમને કેવું લાગે છે?"},
        "options": [
            {"id": "confident", "text": {"en": "Excited/Confident", "gu": "ઉત્સાહિત/આત્મવિશ્વાસ"}},
            {"id": "nervous", "text": {"en": "Nervous/Scared", "gu": "ગભરામણ/ડર"}}
        ]
    },
    {
        "id": "q32_finance",
        "section": "Family Income",
        "type": "single_choice",
        "text": {"en": "What is more important to you regarding money?", "gu": "પૈસા બાબતે તમારા માટે શું વધુ મહત્વનું છે?"},
        "options": [
            {"id": "saving", "text": {"en": "Saving for safety", "gu": "સલામતી માટે બચત"}, "traits": {"finance": "saver"}},
            {"id": "investing", "text": {"en": "Investing for growth", "gu": "વિકાસ માટે રોકાણ"}, "traits": {"finance": "investor"}}
        ]
    },
    {
        "id": "q33_mechanics",
        "section": "Digital Skills",
        "type": "single_choice",
        "text": {"en": "Do you like to understand how house appliances or vehicles work?", "gu": "શું તમને ઘરના સાધનો અથવા વાહનો કેવી રીતે કાર્ય કરે છે તે સમજવું ગમે છે?"},
        "options": [
            {"id": "yes", "text": {"en": "Yes, I am curious", "gu": "હા, મને જિજ્ઞાસા છે"}},
            {"id": "no", "text": {"en": "No, just use them", "gu": "ના, માત્ર તેનો ઉપયોગ કરું છું"}}
        ]
    }
];

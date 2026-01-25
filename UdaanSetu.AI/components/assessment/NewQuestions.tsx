// New 15 comprehensive assessment questions
export const assessmentQuestions = [
  {
    id: "q1",
    category: "education",
    question: {
      en: "What is your current education level?",
      gu: "તમારું વર્તમાન શિક્ષણ સ્તર શું છે?"
    },
    options: [
      { id: "a", text: { en: "Class 8-10", gu: "ધોરણ 8-10" }, score: { education: "secondary", academic: 6 } },
      { id: "b", text: { en: "Class 11-12", gu: "ધોરણ 11-12" }, score: { education: "higher_secondary", academic: 7 } },
      { id: "c", text: { en: "Diploma/ITI", gu: "ડિપ્લોમા/આઈટીઆઈ" }, score: { education: "diploma", practical: 8 } },
      { id: "d", text: { en: "Bachelor's Degree", gu: "સ્નાતક ડિગ્રી" }, score: { education: "graduate", academic: 9 } },
      { id: "e", text: { en: "Master's or Higher", gu: "અનુસ્નાતક અથવા ઉચ્ચ" }, score: { education: "postgraduate", academic: 10 } },
    ],
    required: true,
  },
  {
    id: "q2",
    category: "education",
    question: {
      en: "How were your academic grades in your last examination?",
      gu: "તમારા છેલા પરીક્ષામાં તમારા શૈક્ષણિક ગ્રેડ કેવા હતા?"
    },
    options: [
      { id: "a", text: { en: "Excellent (80%+)", gu: "શાનદાર (80%+)" }, score: { academic_excellence: 9, analytical: 8 } },
      { id: "b", text: { en: "Good (60-80%)", gu: "સારું (60-80%)" }, score: { academic_good: 7, consistent: 7 } },
      { id: "c", text: { en: "Average (40-60%)", gu: "સરેરાશ (40-60%)" }, score: { academic_average: 5, practical: 6 } },
      { id: "d", text: { en: "Below Average (<40%)", gu: "સરેરાશથી ઓછું (<40%)" }, score: { academic_struggle: 3, creative: 7 } },
      { id: "e", text: { en: "Not Applicable/Not evaluated", gu: "લાગુ નથી/મૂલ્યાંકન થયું નથી" }, score: { academic_untested: 5, potential: 6 } },
    ],
    required: true,
  },
  {
    id: "q3",
    category: "family",
    question: {
      en: "What is your family's primary occupation background?",
      gu: "તમારા પરિવારનો મુખ્ય વ્યવસાય પૃષ્ઠભૂમિ શું છે?"
    },
    options: [
      { id: "a", text: { en: "Business/Entrepreneurship", gu: "વ્યવસાય/ઉદ્યમસાહસાનત્ર" }, score: { family_business: 9, risk_taking: 8 } },
      { id: "b", text: { en: "Service/Government Job", gu: "સેવા/સરકારી નોકરી" }, score: { family_service: 8, stability: 9 } },
      { id: "c", text: { en: "Private Sector Job", gu: "ખાનગી ક્ષેત્રની નોકરી" }, score: { family_private: 7, corporate: 7 } },
      { id: "d", text: { en: "Agriculture/Farming", gu: "ખેડી/ખેતી" }, score: { family_agriculture: 6, traditional: 8 } },
      { id: "e", text: { en: "Skilled Labor/Technical", gu: "કુશળ મજદૂર/તકનીકી" }, score: { family_technical: 7, practical: 8 } },
    ],
    required: true,
  },
  {
    id: "q4",
    category: "family",
    question: {
      en: "What is your family's approximate monthly income?",
      gu: "તમારા પરિવારની લગભગ માસિક આવક કેટલી છે?"
    },
    options: [
      { id: "a", text: { en: "Below ₹15,000", gu: "₹15,000 થી ઓછું" }, score: { family_income_low: 3, financial_need: 9 } },
      { id: "b", text: { en: "₹15,000 - ₹30,000", gu: "₹15,000 - ₹30,000" }, score: { family_income_lower_middle: 5, financial_need: 7 } },
      { id: "c", text: { en: "₹30,000 - ₹50,000", gu: "₹30,000 - ₹50,000" }, score: { family_income_middle: 7, financial_need: 5 } },
      { id: "d", text: { en: "₹50,000 - ₹1,00,000", gu: "₹50,000 - ₹1,00,000" }, score: { family_income_upper_middle: 8, financial_need: 3 } },
      { id: "e", text: { en: "Above ₹1,00,000", gu: "₹1,00,000 થી વધુ" }, score: { family_income_high: 9, financial_need: 1 } },
    ],
    required: true,
  },
  {
    id: "q5",
    category: "interests",
    question: {
      en: "Which areas interest you the most for your career?",
      gu: "તમારા કારકિર્દ માટે કયા ક્ષેત્રો તમને સૌથી વધુ રસ પાડે છે?"
    },
    options: [
      { id: "a", text: { en: "Technology & Software", gu: "ટેકનોલોજી અને સોફ્ટવેર" }, score: { tech_interest: 9, analytical: 8 } },
      { id: "b", text: { en: "Healthcare & Medicine", gu: "આરોગ્ય સંભાળ અને દવાઈ" }, score: { healthcare_interest: 9, helping: 8 } },
      { id: "c", text: { en: "Business & Management", gu: "વ્યવસાય અને સંચાલન" }, score: { business_interest: 9, leadership: 7 } },
      { id: "d", text: { en: "Creative Arts & Design", gu: "સર્જનાત્મક કલા અને ડિઝાઇન" }, score: { creative_interest: 9, artistic: 8 } },
      { id: "e", text: { en: "Education & Teaching", gu: "શિક્ષણ અને અધ્યાપન" }, score: { education_interest: 9, social: 7 } },
    ],
    required: true,
  },
  {
    id: "q6",
    category: "interests",
    question: {
      en: "What are your main hobbies in free time?",
      gu: "ફુરસદના સમયમાં તમારા મુખ્ય શોખ શું છે?"
    },
    options: [
      { id: "a", text: { en: "Reading & Learning", gu: "વાંચન અને શિખવા" }, score: { intellectual_hobby: 8, analytical: 7 } },
      { id: "b", text: { en: "Sports & Physical Activities", gu: "રમતો અને શારીરિક પ્રવૃત્તિઓ" }, score: { sports_hobby: 8, physical: 9 } },
      { id: "c", text: { en: "Gaming & Digital Entertainment", gu: "ગેમિંગ અને ડિજિટલ મનોરંજન" }, score: { gaming_hobby: 8, tech_savvy: 7 } },
      { id: "d", text: { en: "Socializing & Friends", gu: "સામાજિકીકરણ અને મિત્રો" }, score: { social_hobby: 8, extroverted: 9 } },
      { id: "e", text: { en: "Creative Pursuits", gu: "સર્જનાત્મક પ્રવૃત્તિઓ" }, score: { creative_hobby: 8, artistic: 9 } },
    ],
    required: true,
  },
  {
    id: "q7",
    category: "psychology",
    question: {
      en: "When you play games, what interests you more?",
      gu: "જ્યારે તમે રમતો રમો છો, તમને શું વધુ રસ પાડે છે?"
    },
    options: [
      { id: "a", text: { en: "Just playing and winning", gu: "ફક્ત રમવું અને જીતવું" }, score: { player_mindset: 7, competitive: 8 } },
      { id: "b", text: { en: "How games are built and programmed", gu: "રમતો કેવી રીતે બનાવાય છે અને પ્રોગ્રામ થાય છે" }, score: { developer_mindset: 9, analytical: 8 } },
      { id: "c", text: { en: "Game strategies and tactics", gu: "રમતની રણનીતિઓ અને યુક્તિઓ" }, score: { strategic_mindset: 8, planning: 7 } },
      { id: "d", text: { en: "Game stories and characters", gu: "રમતની વાર્તાઓ અને પાત્રો" }, score: { creative_mindset: 7, storytelling: 8 } },
      { id: "e", text: { en: "Game art and visual design", gu: "રમતની કલા અને દ્રશ્ય ડિઝાઇન" }, score: { artistic_mindset: 8, visual_thinking: 9 } },
    ],
    required: true,
  },
  {
    id: "q8",
    category: "psychology",
    question: {
      en: "How do you approach learning something completely new?",
      gu: "તમે સંપૂર્ણપણે નવી વસ્તુ શીખવાનું કેવી રીતે અભિગમ લો છો?"
    },
    options: [
      { id: "a", text: { en: "Read instructions first, then try", gu: "પહેલા સૂચના વાંચો, પછી પ્રયત્ન કરો" }, score: { methodical_learner: 8, structured: 9 } },
      { id: "b", text: { en: "Jump in and learn by trial/error", gu: "કૂદો અને પ્રયત્ન/ભૂલ દ્વારા શીખો" }, score: { experiential_learner: 8, practical: 9 } },
      { id: "c", text: { en: "Watch others do it first", gu: "પહેલા અન્યને કરતા જોવો" }, score: { observational_learner: 7, social: 8 } },
      { id: "d", text: { en: "Break it down into small steps", gu: "તેને નાના પગલામાં વિભાજવો" }, score: { analytical_learner: 9, systematic: 8 } },
      { id: "e", text: { en: "Find creative ways to understand", gu: "સમજવા માટે સર્જનાત્મક રીતો શોધો" }, score: { creative_learner: 8, innovative: 9 } },
    ],
    required: true,
  },
  {
    id: "q9",
    category: "vision",
    question: {
      en: "Where do you see yourself in 5 years?",
      gu: "તમે 5 વર્ષમાં પોતાને ક્યા રીતે જોઈ રહ્યા છો?"
    },
    options: [
      { id: "a", text: { en: "Running my own business", gu: "મારો પોતાનો વ્યવસાય ચલાવી રહ્યો" }, score: { entrepreneurial_vision: 9, risk_taking: 8 } },
      { id: "b", text: { en: "In a stable corporate job", gu: "સ્થિર કોર્પોરેટ નોકરીમાં" }, score: { corporate_vision: 7, stability: 9 } },
      { id: "c", text: { en: "Working in government sector", gu: "સરકારી ક્ષેત્રમાં કામ કરી રહ્યો" }, score: { government_vision: 8, security: 9 } },
      { id: "d", text: { en: "Freelancing/Independent work", gu: "ફ્રીલાન્સિંગ/સ્વતંત્ર કામ" }, score: { freelance_vision: 8, autonomy: 9 } },
      { id: "e", text: { en: "Still exploring options", gu: "હજુ વિકલ્પો શોધી રહ્યો છું" }, score: { exploring_vision: 5, flexible: 8 } },
    ],
    required: true,
  },
  {
    id: "q10",
    category: "income",
    question: {
      en: "What is your expected monthly income after 2 years of career?",
      gu: "કારકિર્દના 2 વર્ષ પછી તમારી અપેક્ષિત માસિક આવક કેટલી હોવી જોઈએ?"
    },
    options: [
      { id: "a", text: { en: "₹15,000 - ₹25,000", gu: "₹15,000 - ₹25,000" }, score: { income_expectation_low: 3, realistic: 8 } },
      { id: "b", text: { en: "₹25,000 - ₹40,000", gu: "₹25,000 - ₹40,000" }, score: { income_expectation_medium: 6, realistic: 9 } },
      { id: "c", text: { en: "₹40,000 - ₹60,000", gu: "₹40,000 - ₹60,000" }, score: { income_expectation_good: 8, ambitious: 7 } },
      { id: "d", text: { en: "₹60,000 - ₹1,00,000", gu: "₹60,000 - ₹1,00,000" }, score: { income_expectation_high: 9, ambitious: 8 } },
      { id: "e", text: { en: "Above ₹1,00,000", gu: "₹1,00,000 થી વધુ" }, score: { income_expectation_very_high: 10, very_ambitious: 9 } },
    ],
    required: true,
  },
  {
    id: "q11",
    category: "self_assessment",
    question: {
      en: "What are your biggest strengths?",
      gu: "તમારા સૌથી મોટા ગુણો શું છે?"
    },
    options: [
      { id: "a", text: { en: "Quick learner and adaptable", gu: "ઝડપી શીખનારો અને અનુકૂલનશીલ" }, score: { strength_learning: 9, adaptable: 8 } },
      { id: "b", text: { en: "Hardworking and dedicated", gu: "મહેનતી અને સમર્પિત" }, score: { strength_work_ethic: 9, reliable: 8 } },
      { id: "c", text: { en: "Creative and innovative", gu: "સર્જનાત્મક અને નવીનતામૂલક" }, score: { strength_creativity: 9, innovative: 8 } },
      { id: "d", text: { en: "Good with people and communication", gu: "લોકો સાથે સારું અને સંચાર" }, score: { strength_social: 9, communication: 8 } },
      { id: "e", text: { en: "Analytical and problem-solving", gu: "વિશ્લેષણાત્મક અને સમસ્યા ઉકેલવા" }, score: { strength_analytical: 9, logical: 8 } },
    ],
    required: true,
  },
  {
    id: "q12",
    category: "self_assessment",
    question: {
      en: "What areas do you need to improve?",
      gu: "તમને કયા વિસ્તારોમાં સુધારવાની જરૂર છે?"
    },
    options: [
      { id: "a", text: { en: "Public speaking and confidence", gu: "જાહેર બોલવાની અને આત્મવિશ્વાસ" }, score: { weakness_public_speaking: 5, confidence: 4 } },
      { id: "b", text: { en: "Time management and discipline", gu: "સમય વ્યવસ્થાપન અને અનુશાસન" }, score: { weakness_time_management: 5, discipline: 4 } },
      { id: "c", text: { en: "Technical skills and knowledge", gu: "તકનીકી કૌશળો અને જ્ઞાન" }, score: { weakness_technical: 5, skills: 4 } },
      { id: "d", text: { en: "Patience and emotional control", gu: "ધીરજ અને ભાવનિયંત્રણ" }, score: { weakness_patience: 5, emotional: 4 } },
      { id: "e", text: { en: "Networking and social skills", gu: "નેટવર્કિંગ અને સામાજિક કૌશળો" }, score: { weakness_networking: 5, social: 4 } },
    ],
    required: true,
  },
  {
    id: "q13",
    category: "mobility",
    question: {
      en: "Are you willing to relocate for better career opportunities?",
      gu: "શું તમે વધુ સારી કારકિર્દ તકાવો માટે સ્થાનાંતર કરવા માટે તૈયાર છો?"
    },
    options: [
      { id: "a", text: { en: "Yes, anywhere in India", gu: "હા, ભારતમાં ક્યારે પણ" }, score: { mobility_high: 9, adventurous: 8 } },
      { id: "b", text: { en: "Yes, but within Gujarat only", gu: "હા, પણ ફક્ત ગુજરાતમાં જ" }, score: { mobility_medium: 7, regional_focus: 8 } },
      { id: "c", text: { en: "Maybe, depends on the opportunity", gu: "કદાચિત, તકાવા પર આધાર રાખે છે" }, score: { mobility_conditional: 6, practical: 7 } },
      { id: "d", text: { en: "Prefer to stay near family", gu: "પરિવારની નજીક રહેવું પસંદ છે" }, score: { mobility_low: 4, family_oriented: 9 } },
      { id: "e", text: { en: "No, want to stay in my hometown", gu: "ના, મારા શહેરમાં રહેવા માંગે છે" }, score: { mobility_very_low: 2, rooted: 9 } },
    ],
    required: true,
  },
  {
    id: "q14",
    category: "personality",
    question: {
      en: "How do you handle failure or setbacks?",
      gu: "તમે નિષ્ફળતા અથવા અડચણોને કેવી રીતે સંભાળો છો?"
    },
    options: [
      { id: "a", text: { en: "Learn from it and try again", gu: "તેમાંથી શીખો અને ફરી પ્રયત્ન કરો" }, score: { resilience_high: 9, growth_mindset: 8 } },
      { id: "b", text: { en: "Take time to recover, then move on", gu: "પુનઃપ્રાપ્ત માટે સમય લો, પછી આગળ વધો" }, score: { resilience_medium: 7, emotional_intelligence: 8 } },
      { id: "c", text: { en: "Seek advice from others", gu: "અન્યથી સલાહ માંગો" }, score: { resilience_support_seeking: 6, social_support: 9 } },
      { id: "d", text: { en: "Feel discouraged but persist", gu: "નિરાશ થાઓ પણ હઠીલ રહો" }, score: { resilience_struggling: 5, determined: 7 } },
      { id: "e", text: { en: "Avoid situations where I might fail", gu: "એવી પરિસ્થિતિઓ ટાળો જ્યાં હું નિષ્ફળ થઈ શકું" }, score: { resilience_avoidant: 3, risk_averse: 8 } },
    ],
    required: true,
  },
  {
    id: "q15",
    category: "values",
    question: {
      en: "What motivates you most in life?",
      gu: "જીવનમાં તમને સૌથી વધુ શું પ્રેરિત કરે છે?"
    },
    options: [
      { id: "a", text: { en: "Financial success and security", gu: "નાણાકીય સફળતા અને સુરક્ષા" }, score: { motivator_financial: 9, material_success: 8 } },
      { id: "b", text: { en: "Helping others and social impact", gu: "અન્યની મદદ કરવી અને સામાજિક અસર" }, score: { motivator_social: 9, altruistic: 8 } },
      { id: "c", text: { en: "Personal growth and learning", gu: "વ્યક્તિગત વિકાસ અને શીખવા" }, score: { motivator_growth: 9, self_actualization: 8 } },
      { id: "d", text: { en: "Recognition and respect", gu: "માન્યતા અને સન્માન" }, score: { motivator_recognition: 8, esteem: 9 } },
      { id: "e", text: { en: "Freedom and independence", gu: "સ્વતંત્રતા અને સ્વાતંત્રતા" }, score: { motivator_freedom: 9, autonomy: 8 } },
    ],
    required: true,
  },
];

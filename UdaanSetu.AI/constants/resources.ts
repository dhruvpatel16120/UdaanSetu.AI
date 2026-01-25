// Career Guidance Resources for Rural Youth in India
// Curated list of government schemes, online platforms, YouTube channels, and counseling services

export interface Resource {
  id: string;
  title: {
    en: string;
    gu: string;
  };
  description: {
    en: string;
    gu: string;
  };
  category: "government" | "online" | "youtube" | "counseling" | "skills" | "scholarships" | "jobs";
  url: string;
  languages: ("en" | "gu" | "both")[];
  isFree: boolean;
  tags: string[];
}

export const resources: Resource[] = [
  // Government Schemes
  {
    id: "ncs",
    title: {
      en: "National Career Service (NCS)",
      gu: "રાષ્ટ્રીય કારકિર્દી સેવા (NCS)"
    },
    description: {
      en: "Government portal for career counseling, skill development, and job opportunities. Helpline: 1514",
      gu: "કારકિર્દી પરામર્શ, કૌશલ્ય વિકાસ અને નોકરીની તકો માટે સરકારી પોર્ટલ. હેલ્પલાઇન: 1514"
    },
    category: "government",
    url: "https://www.ncs.gov.in/",
    languages: ["both"],
    isFree: true,
    tags: ["career counseling", "jobs", "training"]
  },
  {
    id: "pmkvy",
    title: {
      en: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
      gu: "પ્રધાનમંત્રી કૌશલ્ય વિકાસ યોજના (PMKVY)"
    },
    description: {
      en: "Free skill training program across 38 sectors with certification. Over 7,000 skill hubs nationwide",
      gu: "પ્રમાણપત્ર સાથે 38 ક્ષેત્રોમાં મફત કૌશલ્ય તાલીમ કાર્યક્રમ. દેશભરમાં 7,000+ કૌશલ્ય હબ"
    },
    category: "government",
    url: "https://www.pmkvyofficial.org/",
    languages: ["both"],
    isFree: true,
    tags: ["skill development", "certification", "free training"]
  },
  {
    id: "ddu-gky",
    title: {
      en: "DDU-GKY (Deen Dayal Upadhyaya Grameen Kaushalya Yojana)",
      gu: "DDU-GKY (દીન દયાળ ઉપાધ્યાય ગ્રામીણ કૌશલ્ય યોજના)"
    },
    description: {
      en: "Skill training for rural youth aged 15-35. Focus on job placement and income diversification",
      gu: "15-35 વર્ષની વયના ગ્રામીણ યુવાનો માટે કૌશલ્ય તાલીમ. નોકરી પ્લેસમેન્ટ અને આવક વૈવિધ્યકરણ પર ધ્યાન"
    },
    category: "government",
    url: "https://rural.gov.in/",
    languages: ["both"],
    isFree: true,
    tags: ["rural youth", "job placement", "skill training"]
  },
  {
    id: "skill-india",
    title: {
      en: "Skill India Digital Hub",
      gu: "સ્કિલ ઇન્ડિયા ડિજિટલ હબ"
    },
    description: {
      en: "Digital platform integrating training, assessment, certification, and employment opportunities",
      gu: "તાલીમ, મૂલ્યાંકન, પ્રમાણપત્ર અને રોજગારની તકોને એકીકૃત કરતું ડિજિટલ પ્લેટફોર્મ"
    },
    category: "government",
    url: "https://www.skillindiadigital.gov.in/",
    languages: ["both"],
    isFree: true,
    tags: ["digital skills", "certification", "employment"]
  },
  
  // Scholarships (NEW)
  {
    id: "pm-scholarship",
    title: {
      en: "PM Scholarship Scheme",
      gu: "પ્રધાનમંત્રી શિષ્યવૃત્તિ યોજના"
    },
    description: {
      en: "Financial assistance for meritorious rural students pursuing higher education.",
      gu: "ઉચ્ચ શિક્ષણ મેળવતા મેઘાવી ગ્રામીણ વિદ્યાર્થીઓ માટે નાણાકીય સહાય."
    },
    category: "scholarships",
    url: "https://scholarships.gov.in/",
    languages: ["both"],
    isFree: true,
    tags: ["scholarship", "financial aid", "rural students"]
  },
  {
    id: "reliance-foundation",
    title: {
      en: "Reliance Foundation Undergraduate Scholarships",
      gu: "રિલાયન્સ ફાઉન્ડેશન અભ્યાસક્રમ શિષ્યવૃત્તિ"
    },
    description: {
      en: "Support for meritorious students from low-income families for undergraduate studies.",
      gu: "અંડરગ્રેજ્યુએટ અભ્યાસ માટે ઓછી આવક ધરાવતા પરિવારોના મેઘાવી વિદ્યાર્થીઓ માટે સહાય."
    },
    category: "scholarships",
    url: "https://www.reliancefoundation.org/",
    languages: ["en"],
    isFree: true,
    tags: ["private scholarship", "undergraduate", "merit-based"]
  },
  {
    id: "hdfc-parivartan",
    title: {
      en: "HDFC Parivartan ECSS",
      gu: "HDFC પરિવર્તન ECSS"
    },
    description: {
      en: "Crisis scholarship support for students facing financial or personal crises.",
      gu: "નાણાકીય અથવા વ્યક્તિગત કટોકટીનો સામનો કરી રહેલા વિદ્યાર્થીઓ માટે શિષ્યવૃત્તિ સહાય."
    },
    category: "scholarships",
    url: "https://www.hdfcbank.com/personal/about-us/corporate-social-responsibility/parivartan",
    languages: ["en"],
    isFree: true,
    tags: ["crisis support", "scholarship", "financial aid"]
  },

  // Job Portals (NEW)
  {
    id: "workindia",
    title: {
      en: "WorkIndia",
      gu: "વર્કઇન્ડિયા"
    },
    description: {
      en: "India's largest blue and grey collar job portal. Direct calling to employers.",
      gu: "ભારતનું સૌથી મોટું બ્લુ અને ગ્રે કોલર જોબ પોર્ટલ. નોકરીદાતાઓને સીધો કૉલ."
    },
    category: "jobs",
    url: "https://www.workindia.in/",
    languages: ["both"],
    isFree: true,
    tags: ["jobs", "blue collar", "hiring"]
  },
  {
    id: "apna",
    title: {
      en: "Apna App",
      gu: "અપના એપ"
    },
    description: {
      en: "Find jobs, build networks, and learn new skills. Popular for local job search.",
      gu: "નોકરીઓ શોધો, નેટવર્ક બનાવો અને નવી કુશળતા શીખો. સ્થાનિક નોકરી શોધ માટે લોકપ્રિય."
    },
    category: "jobs",
    url: "https://apna.co/",
    languages: ["both"],
    isFree: true,
    tags: ["networking", "local jobs", "skills"]
  },
   {
    id: "job-hai",
    title: {
      en: "Job Hai",
      gu: "જોબ હૈ"
    },
    description: {
      en: "Verified jobs for freshers. Delivery, driver, sales, and support roles.",
      gu: "ફ્રેશર્સ માટે ચકાસાયેલ નોકરીઓ. ડિલિવરી, ડ્રાઈવર, વેચાણ અને સપોર્ટ રોલ."
    },
    category: "jobs",
    url: "https://www.jobhai.com/",
    languages: ["both"],
    isFree: true,
    tags: ["verified jobs", "freshers", "part-time"]
  },

  // Online Learning Platforms
  {
    id: "swayam",
    title: {
      en: "SWAYAM",
      gu: "સ્વયં"
    },
    description: {
      en: "Free online courses from Indian universities. Covers school to postgraduate level education",
      gu: "ભારતીય યુનિવર્સિટીઓના મફત ઓનલાઇન કોર્સ. શાળાથી પોસ્ટગ્રેજ્યુએટ સ્તરનું શિક્ષણ આવરી લે છે"
    },
    category: "online",
    url: "https://swayam.gov.in/",
    languages: ["both"],
    isFree: true,
    tags: ["online courses", "university", "free education"]
  },
  {
    id: "eskill-india",
    title: {
      en: "eSkill India",
      gu: "eસ્કિલ ઇન્ડિયા"
    },
    description: {
      en: "1,600+ digital courses in multiple languages. Technical skills, communication, and financial literacy",
      gu: "બહુવિધ ભાષાઓમાં 1,600+ ડિજિટલ કોર્સ. તકનીકી કૌશલ્ય, સંચાર અને નાણાકીય સાક્ષરતા"
    },
    category: "online",
    url: "https://eskillindia.org/",
    languages: ["both"],
    isFree: true,
    tags: ["digital courses", "multilingual", "skill development"]
  },
  {
    id: "evidyaloka",
    title: {
      en: "eVidyaloka",
      gu: "eવિદ્યાલોક"
    },
    description: {
      en: "Digital classrooms for rural schools. Subjects include AI basics, life skills, and leadership",
      gu: "ગ્રામીણ શાળાઓ માટે ડિજિટલ વર્ગખંડો. AI બેઝિક્સ, જીવન કૌશલ્ય અને નેતૃત્વ જેવા વિષયો"
    },
    category: "online",
    url: "https://www.evidyaloka.org/",
    languages: ["both"],
    isFree: true,
    tags: ["digital classroom", "rural education", "AI learning"]
  },
  
  // YouTube Channels
  {
    id: "vidyakul-gujarati",
    title: {
      en: "Vidyakul Gujarati",
      gu: "વિદ્યાકુલ ગુજરાતી"
    },
    description: {
      en: "Educational content in Gujarati with live Q&A on career guidance after 10th and 12th",
      gu: "10મી અને 12મી પછી કારકિર્દી માર્ગદર્શન પર લાઇવ Q&A સાથે ગુજરાતીમાં શૈક્ષણિક સામગ્રી"
    },
    category: "youtube",
    url: "https://www.youtube.com/@VidyakulGujarati",
    languages: ["gu"],
    isFree: true,
    tags: ["gujarati", "career guidance", "live sessions"]
  },
  {
    id: "akrsp-yuvajunction",
    title: {
      en: "AKRSP India - YuvaJunction",
      gu: "AKRSP ઇન્ડિયા - યુવાજંક્શન"
    },
    description: {
      en: "Skill development and digital literacy for rural youth in Gujarat and Bihar",
      gu: "ગુજરાત અને બિહારમાં ગ્રામીણ યુવાનો માટે કૌશલ્ય વિકાસ અને ડિજિટલ સાક્ષરતા"
    },
    category: "youtube",
    url: "https://www.youtube.com/@akrspindia",
    languages: ["both"],
    isFree: true,
    tags: ["rural youth", "digital literacy", "Gujarat"]
  },
  {
    id: "jagar-manacha",
    title: {
      en: "Jagar Manacha - Career Guidance",
      gu: "જાગર મનાચા - કારકિર્દી માર્ગદર્શન"
    },
    description: {
      en: "Systematic career selection guidance for 10th and 12th grade rural students",
      gu: "10મી અને 12મી ધોરણના ગ્રામીણ વિદ્યાર્થીઓ માટે વ્યવસ્થિત કારકિર્દી પસંદગી માર્ગદર્શન"
    },
    category: "youtube",
    url: "https://www.youtube.com/@JagarManacha",
    languages: ["both"],
    isFree: true,
    tags: ["career selection", "rural students", "systematic guidance"]
  },
  
  // Career Counseling Services
  {
    id: "hashtag-counseling",
    title: {
      en: "Hashtag Counseling",
      gu: "હેશટેગ કાઉન્સેલિંગ"
    },
    description: {
      en: "Personalized, affordable online career counseling for rural students across India",
      gu: "સમગ્ર ભારતમાં ગ્રામીણ વિદ્યાર્થીઓ માટે વ્યક્તિગત, પોસાય તેવું ઓનલાઇન કારકિર્દી પરામર્શ"
    },
    category: "counseling",
    url: "https://hashtagcounseling.in/",
    languages: ["both"],
    isFree: false,
    tags: ["personalized counseling", "affordable", "online"]
  },
  {
    id: "advaita-bodhi",
    title: {
      en: "Advaita Bodhi Foundation",
      gu: "અદ્વૈત બોધિ ફાઉન્ડેશન"
    },
    description: {
      en: "Career counseling for rural students to make informed choices and gain employment skills",
      gu: "માહિતગાર પસંદગીઓ કરવા અને રોજગાર કૌશલ્ય મેળવવા માટે ગ્રામીણ વિદ્યાર્થીઓ માટે કારકિર્દી પરામર્શ"
    },
    category: "counseling",
    url: "https://advaitabodhi.org/",
    languages: ["both"],
    isFree: true,
    tags: ["rural focus", "employment skills", "free counseling"]
  },
  {
    id: "mindler",
    title: {
      en: "Mindler",
      gu: "માઇન્ડલર"
    },
    description: {
      en: "Advanced online career assessment and counseling services accessible nationwide",
      gu: "દેશભરમાં સુલભ અદ્યતન ઓનલાઇન કારકિર્દી મૂલ્યાંકન અને પરામર્શ સેવાઓ"
    },
    category: "counseling",
    url: "https://www.mindler.com/",
    languages: ["en"],
    isFree: false,
    tags: ["assessment", "online counseling", "nationwide"]
  },
  {
    id: "bodhami",
    title: {
      en: "Bodhami",
      gu: "બોધમી"
    },
    description: {
      en: "AI-powered career management platform with counseling, learning hubs, and scholarship aid",
      gu: "પરામર્શ, શીખવાના હબ અને શિષ્યવૃત્તિ સહાય સાથે AI-સંચાલિત કારકિર્દી વ્યવસ્થાપન પ્લેટફોર્મ"
    },
    category: "counseling",
    url: "https://www.bodhami.com/",
    languages: ["both"],
    isFree: false,
    tags: ["AI-powered", "scholarships", "learning hubs"]
  },
  
  // Skill Development Organizations
  {
    id: "niit-foundation",
    title: {
      en: "NIIT Foundation",
      gu: "NIIT ફાઉન્ડેશન"
    },
    description: {
      en: "Skill development and vocational training centers in rural areas with placement support",
      gu: "પ્લેસમેન્ટ સહાય સાથે ગ્રામીણ વિસ્તારોમાં કૌશલ્ય વિકાસ અને વ્યાવસાયિક તાલીમ કેન્દ્રો"
    },
    category: "skills",
    url: "https://www.niitfoundation.org/",
    languages: ["both"],
    isFree: true,
    tags: ["vocational training", "placement", "rural centers"]
  },
  {
    id: "edubridge",
    title: {
      en: "EduBridge",
      gu: "એડ્યુબ્રિજ"
    },
    description: {
      en: "Workforce development with skilling, upskilling, and 'Sahi Career' mentorship program",
      gu: "કૌશલ્ય, અપસ્કિલિંગ અને 'સાહી કારકિર્દી' માર્ગદર્શન કાર્યક્રમ સાથે કાર્યબળ વિકાસ"
    },
    category: "skills",
    url: "https://www.edubridgeindia.com/",
    languages: ["both"],
    isFree: false,
    tags: ["workforce development", "mentorship", "upskilling"]
  },
  {
    id: "smile-foundation",
    title: {
      en: "Smile Foundation - Shiksha Na Ruke",
      gu: "સ્માઇલ ફાઉન્ડેશન - શિક્ષા ન રુકે"
    },
    description: {
      en: "Digital literacy and learning access for rural and tribal children",
      gu: "ગ્રામીણ અને આદિવાસી બાળકો માટે ડિજિટલ સાક્ષરતા અને શીખવાની પહોંચ"
    },
    category: "skills",
    url: "https://www.smilefoundationindia.org/",
    languages: ["both"],
    isFree: true,
    tags: ["digital literacy", "tribal children", "rural education"]
  },
  {
    id: "sewa-rural",
    title: {
      en: "SEWA Rural",
      gu: "સેવા રુરલ"
    },
    description: {
      en: "Vocational education and training for women in rural Gujarat areas",
      gu: "ગ્રામીણ ગુજરાત વિસ્તારોમાં મહિલાઓ માટે વ્યાવસાયિક શિક્ષણ અને તાલીમ"
    },
    category: "skills",
    url: "https://www.sewarural.org/",
    languages: ["gu"],
    isFree: true,
    tags: ["women empowerment", "Gujarat", "vocational training"]
  }
];

// Category metadata
export const categoryInfo = {
  government: {
    icon: "🏛️",
    color: "from-blue-500 to-cyan-500"
  },
  online: {
    icon: "💻",
    color: "from-purple-500 to-pink-500"
  },
  youtube: {
    icon: "📺",
    color: "from-red-500 to-orange-500"
  },
  counseling: {
    icon: "🎯",
    color: "from-green-500 to-teal-500"
  },
  skills: {
    icon: "🎓",
    color: "from-orange-500 to-yellow-500"
  },
  scholarships: {
    icon: "💰",
    color: "from-yellow-400 to-orange-500"
  },
  jobs: {
    icon: "💼",
    color: "from-indigo-500 to-purple-600"
  }
};

# UdaanSetu.AI - Career AI Mentor Testing Guide

## 🚀 Quick Start - Testing Your Enhanced AI Mentor

### Prerequisites

1. **Backend**: Python FastAPI server running on `http://localhost:8000`
2. **Frontend**: Next.js app running on `http://localhost:3000`
3. **API Keys**: GEMINI_API_KEY configured in backend `.env`

---

## 📋 Testing Checklist

### ✅ Phase 1: Chat Mentor Enhancements

#### Test 1.1: Platform Information Query

**Language: English**

```
User Query: "What is UdaanSetu.AI?"
Expected Response:
- Explanation of platform mission
- Core features (Assessment, AI Reports, Bilingual Support, etc.)
- Team information (FutureMinds, Dhruv Patel)
- "Made in India 🇮🇳 for Rural India with ❤️"
```

**Language: Gujarati**

```
User Query: "ઉડાનસેતુ.AI શું છે?"
Expected Response:
- Gujarati explanation of platform
- Features explained in simple Gujarati
- Team and mission in Gujarati
```

#### Test 1.2: Skills & Learning Query

**English:**

```
User Query: "How can I learn web development?"
Expected Response:
- Specific skills (HTML, CSS, JavaScript)
- FREE resources (YouTube channels, Coursera free courses)
- Step-by-step roadmap (Week 1: HTML basics, Week 2: CSS, etc.)
- Hindi/Gujarati resources if available
- 3-5 sentences, actionable
```

**Gujarati:**

```
User Query: "હું વેબ ડેવલપમેન્ટ કેવી રીતે શીખી શકું?"
Expected Response:
- Gujarati explanation with technical terms explained
- Free resources
- Simple roadmap
```

#### Test 1.3: Job Market Query

```
User Query: "What is the salary for software developers in Gujarat?"
Expected Response:
- Entry-level salary range (INR format)
- Demand level (High/Medium/Low)
- Required skills
- Growth prospects (1yr, 3yr, 5yr)
- Honest about challenges but encouraging
```

#### Test 1.4: General Career Guidance

```
User Query: "I'm confused about my career. Can you help?"
Expected Response:
- References student's assessment results
- Top career path recommendation
- Career readiness percentage
- Top strengths
- Priority skills to learn
- Encouraging, personalized tone
- 3-5 sentences
```

---

### ✅ Phase 2: Career Roadmap API Testing

#### Test 2.1: Generate Roadmap Endpoint

**Endpoint:** `POST /api/roadmap/generate`

**Request Body (English):**

```json
{
  "user_id": "demo_user_123",
  "career_path": "Software Developer",
  "language": "en"
}
```

**Expected Response:**

```json
{
  "success": true,
  "roadmap": {
    "career_title": "Software Developer",
    "total_duration": "6 months",
    "phases": [
      {
        "phase_number": 1,
        "title": "Foundation Phase",
        "duration": "2 months",
        "goals": ["Learn HTML/CSS", "JavaScript basics"],
        "skills": [
          {
            "name": "HTML",
            "priority": "high",
            "time_needed": "2 weeks"
          }
        ],
        "resources": [
          {
            "title": "FreeCodeCamp HTML Tutorial",
            "type": "YouTube",
            "cost": "Free",
            "language": "English"
          }
        ],
        "projects": [
          {
            "title": "Personal Portfolio Website",
            "description": "Build a simple 3-page website",
            "difficulty": "Beginner"
          }
        ],
        "milestones": ["Complete HTML basics", "Build first webpage"]
      }
    ],
    "certification_options": [...],
    "job_search_strategy": {
      "platforms": ["Naukri", "Internshala"],
      "expected_salary_range": "15k-25k INR (entry)"
    },
    "success_tips": [...]
  }
}
```

**Request Body (Gujarati):**

```json
{
  "user_id": "demo_user_123",
  "career_path": "Software Developer",
  "language": "gu"
}
```

**Expected:** Same structure but descriptions in Gujarati

#### Test 2.2: Skill Gap Analysis

**Endpoint:** `POST /api/roadmap/skill-gap`

**Request Body:**

```json
{
  "current_skills": ["Basic English", "10th pass"],
  "target_career": "Digital Marketing",
  "language": "en"
}
```

**Expected Response:**

```json
{
  "success": true,
  "analysis": {
    "missing_skills": [
      {
        "skill": "Social Media Marketing",
        "importance": "Critical",
        "learn_time": "3 weeks",
        "free_resource": "Google Digital Garage"
      }
    ],
    "existing_strengths": ["Communication", "Creativity"],
    "quick_wins": ["Canva Graphics", "Instagram Basics"],
    "long_term_skills": ["SEO", "Facebook Ads"],
    "overall_readiness": 40
  }
}
```

#### Test 2.3: Popular Career Paths

**Endpoint:** `GET /api/roadmap/popular-paths?language=en`

**Expected Response:**

```json
{
  "success": true,
  "career_paths": [
    {
      "id": "software-developer",
      "title": "Software Developer",
      "category": "Technology",
      "avg_salary": "3-8 LPA",
      "difficulty": "Medium"
    },
    {
      "id": "digital-marketing",
      "title": "Digital Marketing Specialist",
      "category": "Marketing",
      "avg_salary": "2-6 LPA",
      "difficulty": "Easy"
    }
    // ... 10 total paths
  ]
}
```

---

### ✅ Phase 3: Language Switching & Context Continuity

#### Test 3.1: Mid-Conversation Language Switch

1. Start conversation in English
2. Use navbar to switch to Gujarati
3. Expect language popup: "Language changed successfully! Your chat mentor will now respond in ગુજરાતી"
4. Send new message in Gujarati
5. **Expected:** AI responds in pure Gujarati script

#### Test 3.2: Context Preservation

1. Ask: "What skills should I learn for web development?"
2. Get response with HTML, CSS, JS recommendations
3. Ask follow-up: "How long will it take to learn HTML?"
4. **Expected:** AI references previous conversation, gives timeline (2-3 weeks), doesn't repeat full roadmap

---

### ✅ Phase 4: Error Handling

#### Test 4.1: API Unavailable

**Scenario:** Stop backend server, try sending message

**Expected Frontend:**

```
Error Message (English): "Sorry, I'm having trouble connecting to the server. Please try again later."
Error Message (Gujarati): "માફ કરશો, મને સર્વર સાથે કનેક્ટ કરવામાં મુશ્કેલી આવી રહી છે..."
```

#### Test 4.2: Invalid User ID

```json
{
  "user_id": "non_existent_user",
  "message": "Hello",
  "language": "en"
}
```

**Expected:** System uses fallback context, still provides helpful response

---

## 🎯 Success Criteria

### ✅ Chat Quality Metrics

- [ ] Responses are concise (2-5 sentences for follow-ups)
- [ ] First message includes comprehensive context
- [ ] Gujarati responses are pure Gujarati (no code-switching unless necessary)
- [ ] Technical terms are explained in simple language
- [ ] Recommendations prioritize FREE resources
- [ ] Responses are encouraging and realistic

### ✅ Performance Metrics

- [ ] Chat response time < 3 seconds
- [ ] Roadmap generation < 10 seconds
- [ ] No memory leaks in long conversations
- [ ] Language popup shows within 500ms of language switch

### ✅ Functional Metrics

- [ ] Platform queries return accurate information
- [ ] Skills queries provide actionable roadmaps
- [ ] Market queries include salary ranges and demand
- [ ] Roadmap API returns structured 6-month plan
- [ ] Skill gap analysis identifies specific gaps
- [ ] Popular paths endpoint returns 10 careers

---

## 🐛 Common Issues & Fixes

### Issue 1: Gemini API Rate Limit

**Symptom:** "Quota exceeded" error
**Fix:**

```python
# backend/.env
# Use Gemini 2.5 Flash (faster, cheaper)
# Already implemented in code
```

### Issue 2: Slow Responses

**Symptom:** Chat takes > 5 seconds
**Fix:**

- Check if you're on first message (rich context is slower)
- Follow-up messages should be < 3 seconds (lite context)
- Reduce history limit (currently last 6 turns)

### Issue 3: Mixed Language Responses

**Symptom:** AI responds in English when language="gu"
**Fix:**

- Check `lang_instruction` in `chat_mentor.py` (line 40-55)
- Verify CRITICAL LANGUAGE RULE is being sent to LLM
- Check if frontend is sending correct language parameter

### Issue 4: CORS Errors

**Symptom:** `Access-Control-Allow-Origin` error in browser
**Fix:**

```python
# backend/app/main.py
# Already configured - allow all origins in development
allow_origins=["*"]
```

---

## 📊 Test Results Template

```markdown
## Test Date: [DATE]

## Tester: [NAME]

### Chat Mentor Tests

- [ ] Platform Query (EN): PASS / FAIL - Notes: \_\_\_
- [ ] Platform Query (GU): PASS / FAIL - Notes: \_\_\_
- [ ] Skills Query (EN): PASS / FAIL - Notes: \_\_\_
- [ ] Skills Query (GU): PASS / FAIL - Notes: \_\_\_
- [ ] Market Query: PASS / FAIL - Notes: \_\_\_
- [ ] General Career: PASS / FAIL - Notes: \_\_\_

### Roadmap API Tests

- [ ] Generate Roadmap (EN): PASS / FAIL - Notes: \_\_\_
- [ ] Generate Roadmap (GU): PASS / FAIL - Notes: \_\_\_
- [ ] Skill Gap Analysis: PASS / FAIL - Notes: \_\_\_
- [ ] Popular Paths: PASS / FAIL - Notes: \_\_\_

### Language & Context Tests

- [ ] Language Switch: PASS / FAIL - Notes: \_\_\_
- [ ] Context Preservation: PASS / FAIL - Notes: \_\_\_

### Error Handling

- [ ] API Unavailable: PASS / FAIL - Notes: \_\_\_
- [ ] Invalid User: PASS / FAIL - Notes: \_\_\_

### Performance

- Chat Response Time: \_\_\_ seconds
- Roadmap Generation: \_\_\_ seconds
- Memory Usage: Stable / Increasing

### Overall Rating: [1-10]

### Comments:

---
```

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass:**
   - Deploy to Vercel/Railway
   - Monitor API quota usage
   - Collect user feedback

2. **If Tests Fail:**
   - Document specific failures
   - Check logs: `backend/logs/` (if logging configured)
   - Review error messages in browser console
   - Contact team lead (Dhruv Patel)

---

## 📞 Support

**Team FutureMinds**

- Lead: Dhruv Patel (Full Stack + AI Engineer)
- GitHub Issues: [Your GitHub Repo]
- Email: [Your Team Email]

**Made in India 🇮🇳 for Rural India with ❤️**

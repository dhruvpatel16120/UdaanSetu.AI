# 🚀 UdaanSetu.AI - Quick Start Guide

## Prerequisites

- Python 3.10+ (for backend)
- Node.js 18+ (for frontend)
- Git
- Anaconda (optional, recommended for Python env)

---

## 🔧 Backend Setup (FastAPI + Python)

### Step 1: Create Virtual Environment

```powershell
# Navigate to backend folder
cd c:\Users\Dhruv Patel\Documents\GitHub\UdaanSetu.AI\backend

# Create virtual environment (using Anaconda Python)
C:\ProgramData\anaconda3\python.exe -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Requirements.txt should include:**

```
fastapi==0.115.5
uvicorn==0.27.0
python-dotenv==1.0.1
firebase-admin==6.6.0
langchain-google-genai==2.0.8
langchain-core==0.3.28
duckduckgo-search==6.3.11
beautifulsoup4==4.12.3
pandas==2.2.3
pydantic==2.10.5
```

### Step 3: Configure Environment Variables

```powershell
# Create .env file in backend directory
notepad .env
```

**Add these variables:**

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_ADMIN_SDK_PATH=./serviceAccountKey.json
```

### Step 4: Add Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in `backend/` folder

### Step 5: Start Backend Server

```powershell
# Still in backend/ folder with venv activated
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
```

**Test Backend:**
Open browser: `http://localhost:8000/docs`  
You should see FastAPI Swagger UI with allendpoints.

---

## 🎨 Frontend Setup (Next.js)

### Step 1: Install Dependencies

```powershell
# Open NEW terminal (keep backend running)
cd c:\Users\Dhruv Patel\Documents\GitHub\UdaanSetu.AI\frontend

npm install
```

### Step 2: Configure Environment Variables

```powershell
notepad .env.local
```

**Add these variables:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 3: Start Frontend Dev Server

```powershell
npm run dev
```

**Expected Output:**

```
   ▲ Next.js 16.1.4
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

**Test Frontend:**
Open browser: `http://localhost:3000`

---

## ✅ Verify Everything Works

### Test 1: Basic Chat

1. Navigate to `http://localhost:3000/mentor`
2. Type: "What is UdaanSetu.AI?"
3. **Expected:** AI responds with platform information
4. Switch language to Gujarati using navbar translate button
5. Type: "શું છે?"
6. **Expected:** Response in Gujarati script

### Test 2: Career Roadmap API

Open: `http://localhost:8000/docs`

Click on: `POST /api/roadmap/generate`  
Try it out with:

```json
{
  "user_id": "demo_user_123",
  "career_path": "Software Developer",
  "language": "en"
}
```

**Expected:** JSON roadmap with 3 phases

### Test 3: Skill Gap Analysis

In Swagger UI: `POST /api/roadmap/skill-gap`

```json
{
  "current_skills": ["Basic English"],
  "target_career": "Digital Marketing",
  "language": "en"
}
```

**Expected:** JSON with missing skills, quick wins, etc.

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found: langchain_google_genai"

**Fix:**

```powershell
pip install langchain-google-genai
```

### Issue: "Firebase Admin SDK not initialized"

**Fix:**

- Ensure `serviceAccountKey.json` exists in `backend/`
- Check file path in `.env`

### Issue: "CORS error" in frontend

**Fix:**

- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue: "Gemini API quota exceeded"

**Fix:**

- Check your Google Cloud Console quota
- Use Gemini 2.5 Flash (cheaper than Pro)
- Reduce conversation history (currently last 6 turns)

### Issue: Frontend not connecting to backend

**Fix:**

```powershell
# Backend .env should have:
CORS_ORIGINS=http://localhost:3000

# Frontend should call:
http://localhost:8000/api/chat/
```

---

## 🔄 Development Workflow

### Making Backend Changes

```powershell
# Backend auto-reloads with --reload flag
# Just edit .py files and save
# Check logs in terminal
```

### Making Frontend Changes

```powershell
# Next.js has Fast Refresh
# Just edit .tsx files and save
# Check browser console for errors
```

### Testing New Features

1. Update backend code
2. Test in Swagger UI (`/docs`)
3. Update frontend to call new endpoint
4. Test in browser
5. Check TESTING_GUIDE.md for comprehensive test cases

---

## 📁 Key Files to Know

### Backend

```
backend/
├── main.py                          # Entry point
├── app/
│   ├── main.py                      # FastAPI app
│   ├── services/
│   │   ├── chat_mentor.py           # Chat logic ⭐
│   │   ├── career_roadmap.py        # Roadmap generation ⭐
│   │   ├── gemini_service.py        # LLM calls
│   │   └── market_intelligence.py   # Web search
│   └── api/routers/
│       ├── chat.py                  # Chat endpoint ⭐
│       └── roadmap.py               # Roadmap endpoints ⭐
```

### Frontend

```
frontend/
├── app/
│   ├── mentor/
│   │   └── page.tsx                 # Mentor chat UI ⭐
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Theme/styling
├── hooks/
│   └── useI18n.ts                   # Language switching
└── components/
    └── Navbar.tsx                   # Navigation
```

---

## 🎯 Next Steps

1. **Explore the Code:**
   - Read `IMPLEMENTATION_SUMMARY.md`
   - Review `chat_mentor.py` for AI logic
   - Check `career_roadmap.py` for roadmap generation

2. **Run Tests:**
   - Follow `TESTING_GUIDE.md`
   - Test all API endpoints
   - Verify bilingual support

3. **Customize:**
   - Add more career paths in `roadmap.py`
   - Enhance prompts in `chat_mentor.py`
   - Improve UI in `mentor/page.tsx`

4. **Deploy:**
   - Backend → Vercel or Railway
   - Frontend → Vercel
   - Database → Firebase (already configured)

---

## 📞 Need Help?

**Team FutureMinds**

- Lead: Dhruv Patel
- GitHub: [Your Repo]
- Email: [Your Email]

**Documentation:**

- `IMPLEMENTATION_SUMMARY.md` - Full feature overview
- `TESTING_GUIDE.md` - Comprehensive testing
- `TECH_STACK.txt` - Architecture details
- `context.txt` - Project context

---

## 🎉 Success!

If you can:
✅ See Swagger UI at `localhost:8000/docs`  
✅ Load frontend at `localhost:3000`  
✅ Chat with AI mentor  
✅ Get roadmap from `/api/roadmap/generate`

**You're ready to go! 🚀**

**Made in India 🇮🇳 for Rural India with ❤️**

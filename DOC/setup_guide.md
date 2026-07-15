# UdaanSetu.AI - Complete Setup Guide

This guide provides step-by-step instructions to set up the **UdaanSetu.AI** platform, including the FastAPI backend, Next.js frontend, and all integrated services (Database, Firebase, Gemini API).

---

## 🚀 Prerequisites

- **Node.js**: v18 or higher
- **Python**: 3.10 or higher
- **Git**
- **Railway Account** (for PostgreSQL)
- **Firebase Account** (for Auth & Firestore)
- **Google AI Studio Account** (for Gemini API)

---

## 🛠️ Step 1: External Service Setup

### 1. Railway (PostgreSQL Database)

1. Login to [Railway.app](https://railway.app/).
2. Create a new project and select **Provision PostgreSQL**.
3. Go to the **Variables** tab of the database.
4. Copy the `DATABASE_URL`. It should look like: `postgresql://postgres:password@host:port/railway`.

### 2. Firebase (Authentication & Firestore)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `UdaanSetu`.
3. **Authentication**: Enable "Email/Password" sign-in provider.
4. **Firestore Database**: Create a database in "Production mode" and select a region (e.g., `asia-south1`).
5. **Web App**: Register a new Web App to get your configuration.
6. **Admin SDK**:
   - Go to Project Settings > Service Accounts.
   - Click **Generate new private key**.
   - Save the `.json` file as `backend/serviceAccountKey.json`.

### 3. Gemini API (Google AI)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key**.
3. Create a new API key and copy it.

---

## 🐍 Step 2: Backend Setup (FastAPI)

**Option A: Automatic Setup (Recommended for Windows)**

1. Navigate to the `backend` directory.
2. Run the automated setup script:
   ```powershell
   .\setup_backend.ps1
   ```
   This script will automatically create a venv, install dependencies, generate Prisma client, and guide you through database syncing.

**Option B: Manual Setup**

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:

   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` folder:

   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   DATABASE_URL="your_railway_postgresql_url"
   ASSESSMENT_QUESTION_COUNT=5
   ```

5. **Initialize Prisma (Database ORM)**:

   ```bash
   prisma generate
   prisma db push
   ```

6. **Initialize RAG Knowledge Base**:
   The mentor uses a FAISS vector database. You must build it before the first run:

   ```bash
   python scripts/build_knowledge_base.py
   ```

7. **Run the Backend Server**:
   ```bash
   python main.py
   ```
   The backend will be available at `http://127.0.0.1:8000`.

---

## 💻 Step 3: Frontend Setup (Next.js)

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file (or `.env.local`) in the `frontend/` folder with your Firebase config:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## 📁 Project Structure Highlights

- `/backend/app/data`: Contains raw career and training data (JSON/CSV).
- `/backend/app/services/rag_engine.py`: Handles vector search and retrieval.
- `/backend/app/services/chat_mentor.py`: Logic for the AI Career Mentor.
- `/frontend/app/mentor`: The interactive chat interface.
- `/frontend/services/firebase.ts`: Firebase client-side initialization.

---

## 🌐 Deployment

### Backend (Railway)

1. You can deploy the FastAPI app directly on Railway.
2. Ensure you add your Environment Variables in the Railway dashboard.
3. Start command: `python main.py` or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### Frontend (Vercel)

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Set the **Framework Preset** to `Next.js`.
4. Add the `NEXT_PUBLIC_FIREBASE_*` environment variables.
5. Deploy!

---

## 🛠️ Troubleshooting

- **Prisma Issues**: If `prisma generate` fails, ensure you are using `prisma-client-py`.
- **RAG Latency**: Similarity search might be slower on the first run as it loads models into memory.
- **Firebase Auth**: If login fails, ensure the "Email/Password" provider is enabled in the Firebase Console.

---

**Made with ❤️ by UdaanSetu Team**

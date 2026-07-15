# 🚀 Deployment Guide: UdaanSetu.AI on Vercel

> **"From Localhost to Rural India."**

This guide explains how to deploy the full-stack **UdaanSetu.AI** application on Vercel's free tier. We use a **Monorepo Strategy**, where both the Next.js frontend and Python FastAPI backend are hosted on the same domain.

---

## 🏗️ Deployment Architecture

- **Frontend**: Next.js 16 (App Router) deployed as Edge/Serverless functions.
- **Backend**: Python FastAPI deployed as a **Serverless Function** via the `@vercel/python` runtime.
- **Routing**: The root `vercel.json` handles traffic:
  - `/api/*` -> Backend (`backend/main.py`)
  - `/*` -> Frontend (Next.js)

---

## 📋 Prerequisites

1.  A **Vercel** account (connected to GitHub).
2.  A **Firebase** project with Firestore and Authentication enabled.
3.  A **Google AI Studio** API Key (for Gemini 1.5).
4.  Git installed locally.

---

## 🛠️ Step-by-Step Setup

### 1. Prepare Firebase Credentials

Vercel cannot securely store `serviceAccountKey.json` files. We must convert it to a string.

1.  Open your `backend/serviceAccountKey.json`.
2.  Minify the JSON content (remove newlines/spaces) using an online tool or script.
3.  Copy the entire JSON string.

### 2. Configure Environment Variables

Go to your Vercel Project Dashboard > **Settings** > **Environment Variables** and add:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(From your local .env)* | Frontend Auth |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(From your local .env)* | Frontend Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(From your local .env)* | Frontend Auth |
| `GEMINI_API_KEY` | `AIzaSy...` | Backend AI Logic |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type": "service_account", ...}` | Backend Auth (The JSON string from Step 1) |
| `NEXT_PUBLIC_API_URL` | *(Leave Empty)* | Frontend API Base URL (empty means relative path) |

> **Note:** Do NOT set `NEXT_PUBLIC_API_URL` to `localhost`. Leaving it empty or undefined ensures calls go to `/api/...`, which `vercel.json` routes correctly.

### 3. Deploy from GitHub

1.  Push your latest code to GitHub.
2.  Log in to Vercel and **Add New Project**.
3.  Select your repository `UdaanSetu.AI`.
4.  **Framework Preset**: Select **Next.js**.
5.  **Root Directory**: Keep it as `./` (Root).
6.  Click **Deploy**.

Vercel will detect the `vercel.json` and automatically configure the Python runtime for the `backend/` folder and Next.js for the `frontend/` folder.

---

## ⚙️ Backend Serverless Constraints

Using Python on Vercel (AWS Lambda under the hood) has specific limits:

- **Cold Starts**: The first request might take 3-5 seconds to boot the Python environment.
- **Execution Timeout**: Max **10 seconds** on Free Tier. (Our AI responses stream to avoid this, but long initial generations might hit limits).
- **No Local Files**: You cannot save generated PDFs or images to the disk. We use Firestore for all persistence.
- **Memory**: 1024 MB limit. This is why we replaced FAISS with **LeanRAG** (JSON-based).

---

## 🛠️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **404 on /api/user/me** | Check root `vercel.json`. Ensure `backend/requirements.txt` is present. |
| **"Invalid Grant" Error** | You pasted the `FIREBASE_SERVICE_ACCOUNT` incorrectly. It must be valid JSON. |
| **Build Fail (Python)** | Check logs. Ensure you aren't using heavy libraries like `torch` or `transformers`. |
| **CORS Errors** | Should not happen if `NEXT_PUBLIC_API_URL` is empty (Same Origin). |

---

<p align="center">Maintained by <b>Team FutureMinds</b></p>

# 🚀 Deployment Guide: UdaanSetu.AI on Vercel

This guide explains how to deploy the full-stack UdaanSetu application on Vercel's free tier. We use a **Vercel-first monorepo strategy**, where both the Next.js frontend and Python backend are hosted on the same platform.

---

## 🏗️ Deployment Strategy

- **Frontend**: Next.js (App Router) deployed as standard web pages.
- **Backend**: Python scripts inside the `backend/` directory deployed as **Serverless Functions**.
- **Integration**: The root `vercel.json` coordinates routing between the two.

---

## 📋 Prerequisites

1.  A **Vercel** account (connected to GitHub).
2.  A **Firebase** project with Firestore and Authentication enabled.
3.  A **Google AI Studio** API Key (for Gemini).
4.  (Optional) A **Railway** or **Supabase** PostgreSQL instance for the RAG knowledge base.

---

## 🛠️ Step-by-Step Setup

### 1. Configure `vercel.json`

Ensuring the root contains a `vercel.json` that redirects `/api/*` requests to the backend:

```json
{
  "rewrite": [{ "source": "/api/(.*)", "destination": "/backend/$1" }]
}
```

### 2. Prepare Environment Variables

Add the following secrets to your Vercel Project Settings (**Settings > Environment Variables**):

| Variable                          | Source                                    |
| :-------------------------------- | :---------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`    | Firebase Config                           |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Config                           |
| `GEMINI_API_KEY`                  | Google AI Studio                          |
| `FIREBASE_SERVICE_ACCOUNT`        | Minified `serviceAccountKey.json` content |
| `DATABASE_URL`                    | PostgreSQL Connection String              |

### 3. Deploy from GitHub

1.  Push your code to a GitHub repository.
2.  Import the project in Vercel.
3.  Vercel will automatically detect the Next.js frontend.
4.  Ensure the **Root Directory** is set to the repository root.

---

## ⚙️ Backend Serverless Constraints

When running on Vercel Free Tier, keep these limits in mind:

- **Execution Timeout**: 10 seconds (standard) or 30 seconds (Pro). Ensure AI calls are optimized.
- **Memory**: 1024 MB.
- **Statelessness**: No local files are saved between requests. Use Firestore for persistence.

---

## 🛠️ Troubleshooting Deployment

- **404 on API Routes**: Check if `vercel.json` has the correct rewrites.
- **Python Dependency Errors**: Ensure `backend/requirements.txt` is up to date. Vercel automatically installs these during deployment.
- **CORS Issues**: Our `vercel.json` strategy typically avoids CORS by hosting everything on the same domain.

---

<p align="center">Maintained by <b>Team FutureMinds</b></p>

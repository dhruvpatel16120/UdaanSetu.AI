# 📚 UdaanSetu.AI - Developer Documentation

Welcome to the central documentation hub for **UdaanSetu.AI**. This document provides an eagle-eye view of the system architecture and links to specialized guides.

---

## 🛠️ System Architecture

UdaanSetu is designed as a modular, three-tier intelligence system to ensure high performance and context-aware guidance.

### 1. Assessment Engine (The "Bio-Profiler")

- **Goal**: Standardize user raw data into a structured "User Bio Profile".
- **Logic**: Combines deterministic scoring logic with lightweight AI analysis.
- **Output**: JSON containing readiness scores, trait analysis, and a summarized generated bio.

### 2. Career Report Generator (The "Deep Thinker")

- **Goal**: Create comprehensive, data-backed career roadmaps.
- **Mechanism**: Uses **Retrieval-Augmented Generation (RAG)** to merge the User Bio with real-time job market data and localized opportunities.
- **Output**: Detailed 6-month/1-year roadmap, resource links, and salary insights.

### 3. Chat Mentor (The "Guide")

- **Goal**: Provide real-time, interactive career coaching.
- **Mechanism**: A persistent LLM session that remembers the user's profile and previous assessment results to offer tailored advice.

---

## 📂 Specialized Documentation

For deep-dives into specific parts of the system, please refer to the following:

- **Frontend**: [app/README.md](./frontend/README.md) - UI/UX, State Management, and Next.js setup.
- **Backend**: [backend/README.md](./backend/README.md) - API Endpoints, AI Logic, and Python environment.
- **Backend Architecture**: [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md) - Deep technical blueprints of the server.
- **RAG Implementation**: [backend/RAG_GUIDE.md](./backend/RAG_GUIDE.md) - How we handle vector embeddings and knowledge retrieval.
- **Setup Guide**: [setup_guide.md](./setup_guide.md) - Step-by-step local development setup.
- **Deployment**: [deployment_guide.md](./deployment_guide.md) - Instructions for hosting on Vercel.

---

## 🌍 Tech Stack Overview

| Layer        | Technology                                                  |
| :----------- | :---------------------------------------------------------- |
| **Frontend** | Next.js 16, Tailwind CSS 4, Framer Motion                   |
| **Backend**  | Python (FastAPI / Serverless), LangChain                    |
| **Database** | Firebase Firestore (Real-time), JSON (Knowledge Base)       |
| **AI / LLM** | Google Gemini 1.5 Pro/Flash                                 |
| **Auth**     | Firebase Authentication                                     |
| **Hosting**  | Vercel (Frontend & Backend)                                 |

---

<p align="center">Built by <b>Team FutureMinds</b></p>

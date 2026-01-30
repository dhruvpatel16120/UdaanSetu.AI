# ⚙️ UdaanSetu.AI - Backend Intelligence System

<p align="center">
  <img src="../frontend/public/logo.png" alt="UdaanSetu Logo" width="160" />
</p>

<p align="center">
  <strong>"Bridging the rural-digital gap with sophisticated AI guidance."</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=github&logoColor=white" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge&logo=semver&logoColor=white" alt="Version" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-red?style=for-the-badge&logo=apache&logoColor=white" alt="License" />
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Team-FutureMinds-6366F1?style=for-the-badge&logo=target&logoColor=white" alt="Team" />
</p>

---

## 🌟 Overview

The **UdaanSetu Backend** is a high-performance, AI-driven intelligence system designed to empower rural students. Our vision at **FutureMinds** is to provide equitable access to top-tier career mentorship, regardless of geographic or linguistic boundaries.

### 🚀 Vision & Mission

Our team, **FutureMinds**, believes that talent is universal but opportunity is not. This backend serves as the "brain" that translates global career trends into localized guidance for rural youth in **Gujarati** and **English**.

### 🛠️ Core Technologies

- **Google Gemini 1.5 Integration**: Leverages the latest generative models for deep psychometric analysis and personalized career roadmap generation.
- **RAG (Retrieval-Augmented Generation)**: Uses a local knowledge base of PDFs, CSVs, and JSONs to provide grounded, factual advice.
- **Semantic Search**: Powered by **FAISS** and **Sentence Transformers** for lightning-fast retrieval of career data.
- **Async Architecture**: Built on **FastAPI** to ensure low-latency responses for the AI chat mentor.

---

## 📖 Documentation

Dive deeper into our technical implementations and guides.

| Resource                                                  | Description                                                                 |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------- |
| 📐 **[System Architecture](./ARCHITECTURE.md)**           | Detailed overview of the backend's modular design and data pipelines.       |
| 🧠 **[RAG Implementation Guide](./RAG_GUIDE.md)**         | Technical breakdown of vector embeddings, indexing, and context retrieval.  |
| 🔌 **[Interactive API Docs](http://localhost:8000/docs)** | Swagger UI for exploring and testing API endpoints (requires local server). |

---

## ✨ Key Features

- **🤖 Adaptive Psychometric Assessment**: AI-generated questions that evolve based on student responses.
- **📊 SWOT & Bio-Profile Analysis**: Deep psychological analysis of user traits to match with ideal careers.
- **💬 AI Career Mentor**: Real-time chat guidance powered by RAG, trained on specialized career datasets.
- **🌍 Multi-Regional Support**: Native support for **Gujarati** with cultural context awareness.

---

## 🛠️ Tech Stack & Requirements

| Layer               | Technologies                                                                                              | Details                                          |
| :------------------ | :-------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| **Logic Framework** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)           | Async Python framework for high performance.     |
| **Generative AI**   | ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white) | **1.5 Pro/Flash** for reasoning and chat.        |
| **Vector Indexing** | ![FAISS](https://img.shields.io/badge/FAISS-0055FF?style=flat&logo=data-base&logoColor=white)             | Facebook AI Similarity Search for KB retrieval.  |
| **Cloud Services**  | ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)        | Auth, Firestore (Real-time DB), and Storage.     |
| **Data Processing** | ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat&logo=pandas&logoColor=white)              | Handling career datasets and market information. |
| **Language Logic**  | ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=chainlink&logoColor=white)     | Orchestrating LLM chains and prompt templates.   |

---

## 🚀 Getting Started

Follow these professional steps to set up your local development environment.

### 📋 Prerequisites

- **Python**: Version 3.9, 3.10, or 3.11.
- **Git**: For version control.
- **Firebase Project**: An active Firebase project with Firestore enabled.
- **Google AI Studio API Key**: For Gemini model access.

### 1️⃣ Step 1: Firebase Service Account

Securely connect the backend to your project database.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Settings (⚙️) > **Project Settings** > **Service Accounts**.
3.  Click **Generate New Private Key**.
4.  Rename the downloaded file to `serviceAccountKey.json` and place it in the `backend/` root folder.

> 📝 **Note:** This file is listed in `.gitignore` to prevent sensitive credentials from being leaked.

### 2️⃣ Step 2: Environment Setup

Configure your secrets in a `.env` file within the `backend/` directory:

```env
# Get from https://aistudio.google.com/
GEMINI_API_KEY=your_key_here

# Optional Configurations
ENVIRONMENT=development
PORT=8000
```

### 3️⃣ Step 3: RAG Knowledge Base Initialization

The AI mentor needs an index of career data to function.

1.  Place your data files (JSON, CSV, PDF) in `app/data/`.
2.  Build the vector index by running the utility script:
    ```bash
    python scripts/build_knowledge_base.py
    ```

### 4️⃣ Step 4: Installation

Use the automated script for a seamless setup:

```powershell
.\setup_backend.ps1
```

---

## 🏃 Commands & Execution

Use these commands to manage and run the backend server.

| Operation         | Command                                     | Note                             |
| :---------------- | :------------------------------------------ | :------------------------------- |
| **Rapid Launch**  | `.\start_server.ps1`                        | Windows Automated Script         |
| **Dev Server**    | `uvicorn app.main:app --reload --port 8000` | Hot-reloading enabled            |
| **Activate Venv** | `.\venv\Scripts\activate` (Windows)         | Required for manual terminal use |
| **Verify Auth**   | `python scripts/verify_auth.py`             | Connectivity check               |
| **Verify AI**     | `python scripts/verify_qa_engine.py`        | LLM pipeline check               |

---

## 📂 Project Structure

```bash
backend/
├── app/                        # Application Source Code
│   ├── api/                    # API Layer
│   │   ├── dependencies/       # Security & Auth injectables
│   │   └── routers/            # Feature-specific API endpoints
│   ├── assessment_logic/       # AI-driven psychometric engines
│   ├── career_logic/           # Roadmap & Path synthesis logic
│   ├── core/                   # Platform configurations & constants
│   ├── data/                   # Knowledge Base source (JSON/CSV/PDF)
│   ├── mentor_logic/           # RAG-based AI chat mentor logic
│   ├── models/                 # Pydantic data schemas
│   └── services/               # External service clients (Firebase, AI)
├── scripts/                    # Developer & Maintenance scripts
│   ├── build_knowledge_base.py # RAG Index builder
│   ├── verify_auth.py          # Firebase Auth testing
│   └── verify_qa_engine.py     # AI Pipeline validation
├── ARCHITECTURE.md             # Detailed engineering blueprints
├── RAG_GUIDE.md                # Internal RAG implementation guide
├── main.py                     # Root entry point
├── requirements.txt            # Project dependencies
├── setup_backend.ps1           # Environment setup automation
└── start_server.ps1            # Dev server quickstart
```

---

## 🛠️ Troubleshooting

| Issue                      | Potential Solution                                                                                                       |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **JWT Signature Error**    | Re-download `serviceAccountKey.json` from Firebase console; the current one might be corrupted or for the wrong project. |
| **Python Path Error**      | Ensure Python is added to your system environment variables.                                                             |
| **Port Conflict (8000)**   | The server won't start if another app is using port 8000. Use `--port 8001` or kill the existing process.                |
| **Missing Knowledge Base** | Ensure you have run the build script in Step 3 of Getting Started.                                                       |
| **Gemini Key Invalid**     | Verify the `GEMINI_API_KEY` in `.env`. Ensure your Google AI Studio account is active.                                   |

---

## 🤝 Contribution Guidelines

We welcome contributions from developers who share our vision for rural empowerment!

1.  **Fork** the repository and create your feature branch.
2.  Adhere to **PEP 8** coding standards for Python.
3.  Ensure all new logic is covered with appropriate documentation.
4.  Run verification scripts in the `scripts/` folder before submitting.
5.  Open a **Pull Request** with a detailed summary of your changes.

---

## 📄 License & Contact

- **License**: Licensed under the **Apache License 2.0**.
- **Team**: **FutureMinds**
- **Inquiries**: [dhruvpatel16120@gmail.com](mailto:dhruvpatel16120@gmail.com)

---

<p align="center">Built with ❤️ for Rural Empowerment by <b>FutureMinds Team</b></p>

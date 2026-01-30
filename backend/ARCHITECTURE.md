# Backend Architecture: UdaanSetu.AI

This document outlines the structured architecture for the backend reasoning and generation modules. The system is divided into three distinct phases to ensure speed, accuracy, and scalability.

## Module 1: Assessment Engine (The "Bio-Profiler")

**Purpose**: Rapidly analyze user inputs to generate a standardized "User Bio Profile". This profile acts as the fundamental context for all downstream AI tasks.
**Priority**: Speed & User Engagement.

- **Inputs**:
  - `questions_count`: Number of questions asked.
  - `raw_answers`: List of user answers (options/text).
  - `basic_info`: Name, Location, Gender, Age, Education Level.
- **Process**:
  - **Scoring Logic**: Deterministic or lightweight AI scoring of specific traits.
  - **Profile Synthesis**: Aggregating answers into a cohesive narrative.
- **Outputs (JSON)**:
  - **Readiness Score (%)**: Overall readiness for the current job market.
  - **Trait Scores (0-100)**:
    - `Tech Competence`
    - `Ambition`
    - `Tech Affinity`
    - `Financial Awareness`
    - `Confidence`
    - `Clarity`
  - **Snapshot**:
    - `Top Recommendation`: A single, high-confidence career path title.
    - `Key Insights`: 3-4 bullet points on user strengths.
  - **Generated Bio**: A detailed text summary of the user (e.g., "Rahul is a 12th-grade student from Rajkot with high financial awareness...").

## Module 2: Career Report Generator (The "Deep Thinker")

**Purpose**: Generate a comprehensive, reliable career roadmap using RAG and external data.
**Priority**: Depth & Accuracy (Can take longer).

- **Inputs**:
  - `User Bio Profile` (Output of Module 1).
  - `Job Market Context`: Real-time data via RAG/Web Search (Salary trends, Demand in Gujarat/India).
- **Process**:
  - **RAG Retrieval**: Fetch relevant career paths, scholarships, and government schemes matching the Bio Profile.
  - **LLM Synthesis**: Combine Bio + Market Data into a full report.
- **Outputs**:
  - **Detailed Roadmap**: Step-by-step 6-month/1-year plan.
  - **Resources**: Specific YouTube links, courses, portals.
  - **Salary Insights**: Realistic earning potential.

## Module 3: Chat Mentor (The "Guide")

**Purpose**: Interactive guidance to answer specific user queries.
**Priority**: Contextual Relevance.

- **Inputs**:
  - `User Query`: Natural language question.
  - `User Bio Profile`: (Context).
  - `Career Report` (Optional Context if generated).
- **Process**:
  - **Vector Search**: Search across the Knowledge Base and the User's specific Report.
  - **Contextual Answer**: LLM answers _specifically_ for this user (e.g., "Considering your interest in tech (Module 1 detection)...").
- **Tech Stack**:
  - Retrieval: LeanRAG (JSON-based Keyword Search) for Serverless Efficiency.
  - LLM: Gemini 1.5 Pro/Flash.

---

## Technical Flow

1.  **User takes Assessment** -> **Module 1 Runs** -> Returns `Result JSON` & Saves `Bio Profile` to DB.
    - _Frontend shows Result Page (Speedy)._
2.  **User clicks "Generate Report"** -> **Module 2 Runs** (Background/Async) -> Generates `Full Report`.
    - _Frontend shows Loading -> Full Report View._
3.  **User asks Question** -> **Module 3 Runs** -> Returns `Chat Response`.

# 🏗️ UdaanSetu.AI - Frontend Architecture

<p align="center">
  <img src="../public/logo.png" alt="UdaanSetu Logo" width="120" />
</p>

<p align="center">
  <strong>"The Blueprint for Bridging Rural Dreams to Digital Careers."</strong>
</p>

<p align="center">
  <a href="https://udaansetuai.vercel.app">
    <img src="https://img.shields.io/badge/Live_Prototype-Vercel-blue?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Prototype" />
  </a>
  <img src="https://img.shields.io/badge/Architecture-Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Styles-Tailwind_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

## 🗺️ System Overview

UdaanSetu.AI is architected as a robust, scalable Next.js web application leveraging the cutting-edge features of **Next.js 16 (App Router)** and **React 19**. Our architecture is designed to handle complex state transitions, dynamic career profiling, and deep bilingual support while maintaining a premium performance profile.

### 🧩 Core pillars

> [!IMPORTANT]
> **Mission-Driven Engineering**
> Every architectural decision is weighed against its impact on rural accessibility and student success.
> Our architecture isn't just about code; it's about accessibility and empowerment for the rural youth.

1.  **Adaptive UX**: The interface evolves as the student progresses. Questions, dashboards, and recommendations are dynamically computed to prevent cognitive overload.
2.  **Bilingual Logic**: Not just a translation layer—we use a "Bilingual-First" approach where every visual and logic component is aware of **Gujarati** and **English** contexts.
3.  **Glassmorphism & Depth**: Inspired by the "Sunrise over Fields" theme, using high-end blur effects, soft glows, and layered transparency.
4.  **Edge-Ready Serverless**: Designed to work. Vercel routes frontend pages to the Next.js app and API requests directly to the serverless Python backend.

---

## 🌊 Technical Flow

```
graph TD
    User([👤 Rural Student]) --> App[🚀 Next.js App Router]

    subgraph "Global State Layer"
        App --> Contexts{Context Providers}
        Contexts --> Auth[🔐 Firebase Auth Client]
        Contexts --> i18n[🌐 Bilingual State]
        Contexts --> Theme[🌙 Theme Mode]
    end

    subgraph "Logic & Application Layer"
        App --> Pages[Route Segments]
        Pages --> Assessment[🧠 Adaptive Q&A Engine]
        Pages --> Dashboard[📊 Insights Hub]
        Pages --> Mentor[🤖 AI Mentor Chat]
    end

    subgraph "Data Persistence & API"
        Pages --> Services[🛠️ Service Layer]
        Services --> FirebaseAuth[[🔥 Firebase Auth Client]]
        Services --> API[[🐍 Python Backend API]]
        API --> DB[(🗄️ Backend Data Store)]
    end
```

---

## 📂 Deep Dive: Module Breakdown

### 1. 📝 Assessment Engine (`/app/assessment`)

The heartbeat of the platform. This is a **Dynamic Question Engine** driven by backend state orchestration.

- **Logic**: The frontend fetches questions dynamically and tracks responses. Choices map to psychological traits (e.g., Risk, Logic, Creativity).
- **Branching**: Next question requests are computed and served by the API based on previous answers to dive deeper into identified interests.
- **Progress Sync**: Every choice/step is synchronized with the backend API to allow students to continue their assessment sessions later.

### 2. 📊 Insights Dashboard (`/app/dashboard`)

A data-rich visualization hub that utilizes **Parallel Data Orchestration**.

- **Performance**: Fetches profile, assessment status, and career report data in parallel using modern data fetching hooks and async actions.
- **Visuals**: Features dynamic progress bars, status badges, and quick-action cards that guide the user to the "Next Best Action."

### 3. 🤖 AI Career Mentor (`/app/mentor`)

An interactive, context-aware interface for chat interactions.

- **Chat Interface**: Built on React 19 compatibility, managing user input and streaming/rendering markdown-rich AI responses.
- **Markdown Support**: Renders complex career roadmaps, tables, and instructions using `react-markdown` and `remark-gfm`.
- **Context Injection**: The backend API manages assessment context injection behind the scenes to supply the student's profile and assessment results to the LLM.

---

## 🎨 Design System & Visuals

We use a "Design-Token" approach powered by **Tailwind CSS 4**.

| Token Type           | Values                             | Purpose                                    |
| :------------------- | :--------------------------------- | :----------------------------------------- |
| **Gradients**        | `Night-Sky` → `Sunrise`            | User journey progress signifier.           |
| **Typography**       | `Poppins` (EN), `Noto Sans` (GU)   | Optimizing readability for dual languages. |
| **Glassmorphism**    | `blur(12px)`, `border: 1px active` | Creating a sense of futuristic depth.      |
| **Micro-Animations** | `Staggered Fades`, `Logo Glow`     | Providing feedback and delight.            |

---

## 🔄 State & Auth Orchestration

The application uses a **Tiered State Model**:

1.  **Auth (Firebase Client SDK)**: Firebase Authentication is initialized and managed directly on the frontend. The client SDK retrieves secure ID tokens used to authorize requests to backend API endpoints.
2.  **I18n (Context)**: A global translation dictionary that allows the entire UI to switch languages instantly without a hard refresh.
3.  **Local State**: High-frequency updates (like chat input or assessment progress) are kept within local `useState` and state variables to minimize unnecessary re-renders.

---

## 🛠️ Key Technologies & Specs

- **Base**: Next.js 16 (React 19), TypeScript 5.x
- **Security**: Firebase Authentication SDK on the client side.
- **Styling**: PostCSS 8 + Tailwind 4 (JIT Mode).
- **State**: React Context API & custom hooks.
- **Icons**: Lucide React (SVG-based).

---

<p align="center">
  Generated with 🧡 by <strong>Team FutureMinds</strong>
  <br />
  <em>"Engineering the Bridge from Rural Assets to Global Careers."</em>
</p>

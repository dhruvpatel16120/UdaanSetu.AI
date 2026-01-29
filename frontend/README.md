# 🚀 UdaanSetu.AI - Frontend

<p align="center">
  <img src="public/logo.png" alt="UdaanSetu Logo" width="160" />
</p>

<p align="center">
  <strong>"A bridge from rural dreams to digital careers."</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=github&logoColor=white" alt="Status" />
  <img src="https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge&logo=semver&logoColor=white" alt="Version" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-red?style=for-the-badge&logo=apache&logoColor=white" alt="License" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <a href="https://udaansetuai.vercel.app">
    <img src="https://img.shields.io/badge/Live_Prototype-Vercel-blue?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Prototype" />
  </a>
</p>

---

## 🌟 Overview

**UdaanSetu.AI** is an AI-powered digital career and skill mentor specifically built for rural students and youth who have completed their schooling or Class 10th. It bridges the gap between rural education and digital careers by providing guidance in regional languages—**Gujarati** and **English**.

🔗 **Live Prototype**: [udaansetuai.vercel.app](https://udaansetuai.vercel.app)

The platform provides a complete end-to-end journey: from adaptive assessments and **SWOT analysis** to high-fidelity **Bio-Profiles** and predicted career roadmaps powered by **real-time job market data**.

For a deep dive into how everything works under the hood, check out our **[Frontend Architecture Guide](./ARCHITECTURE.md)**.

---

## 🛠️ Tech Stack

| Technology                                                                                                     | Description                                   |
| :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)                 | **Framework**: Next.js 15 (App Router)        |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)       | **Language**: Strong typing for scalable code |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | **Styling**: Utility-first CSS framework      |
| ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)             | **Backend/Auth**: fast and secure backend     |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white)     | **Animations**: Fluid and complex animations  |
| ![Lucide](https://img.shields.io/badge/Lucide-F7931A?style=flat&logo=lucide&logoColor=white)                   | **Icons**: Beautiful & consistent icon set    |

---

## ✨ Features

- **🎨 Modern UI/UX**: Glassmorphism, smooth gradients, and responsive design.
- **🔐 Secure Authentication**: Robust login and session management via Firebase.
- **📊 Interactive Dashboard**: Visual user profile and career reports.
- **🤖 AI Chat Mentor**: Real-time guidance using advanced AI integration.
- **📱 Fully Responsive**: Optimized for Desktop, Tablet, and Mobile.
- **⚡ High Performance**: Fast load times with Next.js optimization.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/dhruvpatel16120/UdaanSetu.AI.git
    cd UdaanSetu.AI/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the `frontend` directory and add your Firebase configuration. You can refer to `firebase config.example` for the required keys.

- step 1: create `.env`

  ```bash
  touch .env
  ```

- step 2: add firebase required keys.
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
  NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef1234567890abcdef12
  ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open in browser:**
    Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Scripts & Commands

| Command         | Description                                       |
| :-------------- | :------------------------------------------------ |
| `npm run dev`   | Starts the development server with hot-reloading. |
| `npm run build` | Compiles the application for production use.      |
| `npm run start` | Runs the compiled production version.             |
| `npm run lint`  | Checks for code quality and linting errors.       |

---

## 📂 Folder Structure

```bash
frontend/
├── app/                  # App Router: Pages, layouts, and global styles
│   ├── (auth)/           # Authentication flows (Login, Sign-up)
│   ├── assessment/       # Adaptive career assessment engine
│   ├── dashboard/        # Main user dashboard (Stats, Quick Actions)
│   ├── mentor/           # AI Career Coach (Chat interface)
│   ├── profile/          # User profile view & edit
│   ├── career-report/    # AI-generated analytical reports
│   ├── layout.tsx        # Root layout with context providers
│   └── globals.css       # Core design system & tailwind imports
├── components/           # Reusable UI components
│   ├── ui/               # Primitive components (Buttons, Inputs)
│   ├── layout/           # Shared layout components (Navbar, Sidebar)
│   ├── assessment/       # Features-specific UI components
│   └── common/           # Error boundaries and common helpers
├── services/             # API clients & external integrations (Firebase)
│   ├── auth/             # Authentication logic
│   └── userService.ts    # User data & report services
├── hooks/                # Custom React hooks (useAuth, useI18n)
├── store/                # Global state (Theme, Auth, Language contexts)
├── constants/            # Global configs, translations, and routes
├── types/                # TypeScript interfaces & type definitions
├── utils/                # Utility functions & formatting helpers
└── public/               # Static assets (Images, Logos, Favicons)
```

---

## 🤝 Contribution

We believe in the power of open-source! Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

1. **Fork** the Project
2. Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

---

## 📄 License

Distributed under the **Apache License 2.0**. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ by the <b>UdaanSetu Team</b></p>

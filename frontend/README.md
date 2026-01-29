# 🚀 UDP (UdaanSetu Frontend)

![Project Status](https://img.shields.io/badge/status-active-success) ![Version](https://img.shields.io/badge/version-0.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

A stunning, responsive, and high-performance frontend for UdaanSetu, built with the latest web technologies.

---

## 🌟 Overview

UdaanSetu is an AI-powered platform designed to guide users through their career journey. This repository contains the frontend implementation, featuring a modern dashboard, seamless authentication, and an interactive chat mentor.

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

    ```bash
    cp firebase config.example .env
    ```

    or

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

## 📂 Project Structure

```bash
frontend/
├── app/                  # App Router pages & layouts
│   ├── dashboard/        # Protected user dashboard
│   ├── auth/             # Authentication pages
│   └── ...
├── components/           # Reusable UI components
├── services/             # API services & integrations
├── hooks/                # Custom React hooks
├── store/                # State management
└── public/               # Static assets
```

---

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">Made with ❤️ by the UdaanSetu Team</p>

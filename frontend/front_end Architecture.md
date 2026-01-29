# Frontend Architecture

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context / Hooks
- **Backend / Auth**: Firebase

## Folder Structure

### `app/`

Contains the application's routes and layouts.

- `layout.tsx`: The root layout for the application.
- `page.tsx`: The home page.
- `dashboard/`: Protected dashboard routes.
- `auth/`: Authentication routes (login, cancel).
- `error.tsx`: Runtime error boundary.
- `global-error.tsx`: Global error boundary.

### `components/`

Reusable UI components.

- `ui/`: Generic UI components (likely from shadcn/ui or similar).
- Features-specific components (e.g., `Navbar`, `Footer`).

### `hooks/`

Custom React hooks for logic reuse.

### `services/`

API services and integration logic (e.g., Firebase, backend API calls).

### `store/`

Global state management stores (if applicable).

### `utils/`

Utility functions and helpers.

## Key Concepts

### Layouts

The application uses nested layouts. The root layout provides global providers and styles. The dashboard layout manages the sidebar and protected route context.

### Authentication

Authentication is handled via Firebase. The `auth/` directory manages the sign-in flow.

### Error Handling

- **Client-Side**: `error.tsx` catches runtime errors in route segments.
- **Global**: `global-error.tsx` catches errors in the root layout or template.

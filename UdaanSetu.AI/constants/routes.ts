export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  assessment: "/assessment",
  about: "/about",
  resources: "/resources",
  auth: {
    root: "/auth",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
    verifyEmail: "/auth/verify-email",
  },
} as const;

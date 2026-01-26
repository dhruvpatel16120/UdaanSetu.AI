export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  assessment: "/assessment",
  assessmentResult: "/assessment/result",
  mentor: "/mentor",
  careerReport: "/career-report",
  about: "/about",
  resources: "/resources",
  profile: "/profile",
  profileEdit: "/profile/edit",
  auth: {
    root: "/auth",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
    verifyEmail: "/auth/verify-email",
  },
} as const;

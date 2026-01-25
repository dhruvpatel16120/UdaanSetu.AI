export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

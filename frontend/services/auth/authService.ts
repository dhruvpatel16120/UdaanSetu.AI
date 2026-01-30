import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

import { getFirebaseAppSafe } from "@/services/firebase/client";

function getFirebaseAuthSafe(): Auth | null {
  const app = getFirebaseAppSafe();
  if (!app) {
    return null;
  }

  return getAuth(app);
}

function requireFirebaseAuth(): Auth {
  const auth = getFirebaseAuthSafe();
  if (!auth) {
    throw new Error(
      "Firebase config missing. Create udaansetu/.env.local and set NEXT_PUBLIC_FIREBASE_* env vars.",
    );
  }

  return auth;
}

export const authService = {
  onAuthStateChanged(callback: (user: User | null) => void) {
    const auth = getFirebaseAuthSafe();
    if (!auth) {
      callback(null);
      return () => undefined;
    }

    return onAuthStateChanged(auth, callback);
  },

  async signInWithEmailPassword(email: string, password: string) {
    try {
      const auth = requireFirebaseAuth();
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
        console.error("DEBUG: signInWithEmailPassword error:", error);
      }
      throw error;
    }
  },

  async signUpWithEmailPassword(email: string, password: string) {
    const auth = requireFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential;
  },

  async signInWithGooglePopup() {
    try {
      const auth = requireFirebaseAuth();
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
        console.error("DEBUG: signInWithGooglePopup error:", error);
        // Alert helpful validation errors in dev/debug mode
        if (error instanceof Error && error.message.includes("auth/configuration-not-found")) {
           alert("Firebase Auth Config Not Found. Check console for details.");
        }
      }
      throw error;
    }
  },

  async sendPasswordReset(email: string) {
    const auth = requireFirebaseAuth();
    return sendPasswordResetEmail(auth, email);
  },

  async resendVerificationEmail() {
    const auth = requireFirebaseAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user.");
    }

    return sendEmailVerification(user);
  },

  async refreshUser() {
    const auth = requireFirebaseAuth();
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    await reload(user);
    return user;
  },

  async signOut() {
    const auth = requireFirebaseAuth();
    return signOut(auth);
  },
};

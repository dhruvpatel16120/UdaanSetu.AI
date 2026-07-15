import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reload,
  type Auth,
  type User,
} from "firebase/auth";

import { getFirebaseAppSafe } from "@/services/firebase/client";

// Get FirebaseAuth helper (returns null if Firebase config is missing)
function getFirebaseAuth(): Auth | null {
  const app = getFirebaseAppSafe();
  if (!app) return null;
  return getAuth(app);
}

// Require FirebaseAuth helper (throws if config is missing)
function requireFirebaseAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase configuration is missing. Please check your environment variables.");
  }
  return auth;
}

export const authService = {
  // Auth state listener
  onAuthStateChanged(callback: (user: User | null) => void) {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => undefined;
    }
    return onAuthStateChanged(auth, callback);
  },

  // Sign in user with email & password
  async signInWithEmailPassword(email: string, password: string) {
    const auth = requireFirebaseAuth();
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Create new account and send verification email
  async signUpWithEmailPassword(email: string, password: string) {
    const auth = requireFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await sendEmailVerification(credential.user);
    }
    return credential;
  },

  // Sign in using Google Sign-In popup
  async signInWithGooglePopup() {
    const auth = requireFirebaseAuth();
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  },

  // Send password reset email
  async sendPasswordReset(email: string) {
    const auth = requireFirebaseAuth();
    return await sendPasswordResetEmail(auth, email);
  },

  // Resend email verification
  async resendVerificationEmail() {
    const auth = requireFirebaseAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found to verify.");
    }
    return await sendEmailVerification(user);
  },

  // Refresh user data (used to check emailVerified flag state changes)
  async refreshUser() {
    const auth = requireFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    await reload(user);
    return auth.currentUser;
  },

  // Sign out user session
  async signOut() {
    const auth = requireFirebaseAuth();
    return await signOut(auth);
  },
};

"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import type { AuthStatus, AuthUser } from "@/types/auth";
import { authService } from "@/services/auth/authService";
import { mapFirebaseUser } from "@/utils/mapFirebaseUser";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    try {
      const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        // Enforce Email Verification
        if (!firebaseUser.emailVerified) {
          const isVerifyPage = window.location.pathname.includes("/auth/verify-email");
          if (!isVerifyPage) {
            console.log("User not verified, signing out...");
            await authService.signOut();
            setUser(null);
            setStatus("unauthenticated");
            return;
          }
        }

        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
        setStatus("authenticated");

        // Secure Sync with Backend
        try {
          const token = await firebaseUser.getIdToken();
          const syncRes = await fetch('http://localhost:8000/api/user/sync', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              email: mappedUser.email,
              name: mappedUser.displayName
            })
          });

          if (syncRes.status === 503) {
            console.error("⚠️ Backend Auth Service Unavailable (Clock/Creds issue). Sync paused.");
            // We don't block the user from the app, but we know sync failed.
          } else if (!syncRes.ok) {
            console.error(`Sync failed with status: ${syncRes.status}`);
          }

        } catch (err) {
          console.error("Failed to sync user with backend:", err);
          // Optional: Show toast error to user?
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      // eslint-disable-next-line
      setUser(null);
      setStatus("unauthenticated");
      return () => undefined;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const refreshed = await authService.refreshUser();
    setUser(refreshed ? mapFirebaseUser(refreshed) : null);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, refreshUser, signOut }),
    [refreshUser, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

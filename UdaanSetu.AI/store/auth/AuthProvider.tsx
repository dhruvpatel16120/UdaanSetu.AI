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
      const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        setUser(mapFirebaseUser(firebaseUser));
        setStatus("authenticated");
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

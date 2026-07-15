"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";

import type { AuthStatus, AuthUser } from "@/types/auth";
import { authService } from "@/services/auth/authService";
import { mapFirebaseUser } from "@/utils/mapFirebaseUser";
import { ENV } from "@/constants/env";
import { toast } from "sonner";

const PROTECTED_ROUTES = ["/assessment", "/mentor", "/career-report", "/dashboard", "/profile"];
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours session timeout

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
  const pathname = usePathname();
  const router = useRouter();
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem("auth_login_timestamp");
    if (sessionTimeoutRef.current) {
      clearInterval(sessionTimeoutRef.current);
    }
  }, []);

  // Sync user with backend in background (warnings logged to console, no blocker for frontend)
  const syncUserWithBackend = async (firebaseUser: User, mappedUser: AuthUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const syncUrl = `${ENV.apiUrl}/api/user/sync`;
      
      await fetch(syncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: mappedUser.email,
          name: mappedUser.displayName,
        }),
      });
      console.log("User sync request sent to backend (if running).");
    } catch (err: unknown) {
      console.warn("Backend user sync skipped (backend is not running):", err);
    }
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setStatus("unauthenticated");
        clearSession();
        return;
      }

      // STRICT email verification policy:
      // If user logs in but their email is not verified, and they are not currently on the verification page
      if (!firebaseUser.emailVerified) {
        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
        setStatus("authenticated");

        const isVerifyPage = window.location.pathname.includes("/auth/verify-email");
        if (!isVerifyPage) {
          console.log("User email is not verified. Redirecting to verify-email...");
          router.push("/auth/verify-email");
        }
        return;
      }

      const mappedUser = mapFirebaseUser(firebaseUser);
      setUser(mappedUser);
      setStatus("authenticated");

      // Setup session timestamp
      const storedTimestamp = localStorage.getItem("auth_login_timestamp");
      if (!storedTimestamp) {
        localStorage.setItem("auth_login_timestamp", Date.now().toString());
      }

      // Background synchronization (fails silently without toast notifications)
      syncUserWithBackend(firebaseUser, mappedUser);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      if (sessionTimeoutRef.current) clearInterval(sessionTimeoutRef.current);
    };
  }, [clearSession, router]);

  // Auth Guard Logic
  useEffect(() => {
    if (status === "loading") return;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (isProtectedRoute) {
      if (status === "unauthenticated") {
        console.log(`Access blocked for protected route: ${pathname}. Redirecting to auth.`);
        router.push("/auth");
        toast.error("Authentication required. Please sign in.");
      } else if (status === "authenticated" && user && !user.emailVerified) {
        console.log(`Access blocked for unverified user on route: ${pathname}. Redirecting to verify-email.`);
        router.push("/auth/verify-email");
        toast.error("Please verify your email address to access this page.");
      }
    }
  }, [pathname, status, user, router]);

  // Session Timeout Check Logic
  useEffect(() => {
    if (status !== "authenticated") return;

    const checkTimeout = () => {
      const storedTimestamp = localStorage.getItem("auth_login_timestamp");
      if (storedTimestamp) {
        const loginTime = parseInt(storedTimestamp, 10);
        const currentTime = Date.now();
        
        if (currentTime - loginTime >= SESSION_TIMEOUT) {
          console.log("Session expired. Logging user out...");
          toast.info("Session expired. Please sign in again.");
          authService.signOut().then(() => {
            clearSession();
            setUser(null);
            setStatus("unauthenticated");
            router.push("/auth");
          });
        }
      }
    };

    checkTimeout();
    sessionTimeoutRef.current = setInterval(checkTimeout, 60000); // Check every minute

    return () => {
      if (sessionTimeoutRef.current) {
        clearInterval(sessionTimeoutRef.current);
      }
    };
  }, [status, router, clearSession]);

  const refreshUser = useCallback(async () => {
    const refreshed = await authService.refreshUser();
    setUser(refreshed ? mapFirebaseUser(refreshed) : null);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/auth");
  }, [clearSession, router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, refreshUser, signOut }),
    [refreshUser, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

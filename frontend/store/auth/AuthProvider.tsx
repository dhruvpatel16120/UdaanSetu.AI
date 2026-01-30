"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { AuthStatus, AuthUser } from "@/types/auth";
import { authService } from "@/services/auth/authService";
import { mapFirebaseUser } from "@/utils/mapFirebaseUser";
import { ENV } from "@/constants/env";
import { toast } from "sonner";

const PROTECTED_ROUTES = ["/assessment", "/mentor", "/career-report", "/dashboard", "/profile"];
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

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
  const timeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem("auth_login_timestamp");
    if (timeoutIntervalRef.current) {
      clearInterval(timeoutIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    // Move sync logic into a separate function to keep onAuthStateChanged synchronous
    const handleUserSync = async (firebaseUser: import("firebase/auth").User, mappedUser: AuthUser) => {
      try {
        const token = await firebaseUser.getIdToken();
        const syncUrl = `${ENV.apiUrl}/api/user/sync`;
        
        const syncRes = await fetch(syncUrl, {
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
          toast.error("Auth server is currently unavailable. Please try again later.", {
            description: "System clock or credentials issue detected."
          });
        } else if (!syncRes.ok) {
          console.error(`Sync failed with status: ${syncRes.status}`);
          toast.error(`Sync failed (${syncRes.status}). Some features may be limited.`);
        } else {
           console.log("✅ User sync successful");
        }
      } catch (err: unknown) {
        console.error("Failed to sync user with backend:", err);
        // Specifically handle "Failed to fetch" which usually means server is down or CORS issue
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage === "Failed to fetch") {
          toast.error("Network Error: Could not connect to backend server.", {
            description: "Please check if the backend is running and CORS is configured."
          });
        } else {
          toast.error("An error occurred while syncing your profile.");
        }
      }
    };

    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
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
          authService.signOut().then(() => {
            setUser(null);
            setStatus("unauthenticated");
          });
          return;
        }
      }

      const mappedUser = mapFirebaseUser(firebaseUser);
      setUser(mappedUser);
      setStatus("authenticated");

      // Handle Session Timeout Timestamp
      const storedTimestamp = localStorage.getItem("auth_login_timestamp");
      if (!storedTimestamp) {
        localStorage.setItem("auth_login_timestamp", Date.now().toString());
      }

      // Secure Sync with Backend - triggers asynchronously
      handleUserSync(firebaseUser, mappedUser);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
      }
    };
  }, []);

  // Auth Guard Logic
  useEffect(() => {
    if (status === "loading") return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute && status === "unauthenticated") {
      console.log(`Protected route detected: ${pathname}. Redirecting to login.`);
      router.push("/auth");
      toast.error("Please log in to access this page.");
    }
  }, [pathname, status, router]);

  // Session Timeout Check Logic
  useEffect(() => {
    if (status !== "authenticated") return;

    const checkTimeout = () => {
      const storedTimestamp = localStorage.getItem("auth_login_timestamp");
      if (storedTimestamp) {
        const loginTime = parseInt(storedTimestamp, 10);
        const currentTime = Date.now();
        
        if (currentTime - loginTime >= SESSION_TIMEOUT) {
          console.log("Session expired. Logging out...");
          toast.info("Your session has expired. Please log in again.");
          authService.signOut().then(() => {
            clearSession();
            setUser(null);
            setStatus("unauthenticated");
            router.push("/auth");
          });
        }
      }
    };

    // Check immediately and then every minute
    checkTimeout();
    timeoutIntervalRef.current = setInterval(checkTimeout, 60000);

    return () => {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
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
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, refreshUser, signOut }),
    [refreshUser, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

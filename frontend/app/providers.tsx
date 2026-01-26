"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/store/auth/AuthProvider";
import { I18nProvider } from "@/store/i18n/I18nProvider";
import { ThemeProvider } from "@/store/theme/ThemeProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

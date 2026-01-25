"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/store/auth/AuthProvider";
import { I18nProvider } from "@/store/i18n/I18nProvider";
import { ThemeProvider } from "@/store/theme/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

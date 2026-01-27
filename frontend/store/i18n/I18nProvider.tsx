"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_LANGUAGE, LANGUAGE_LABELS, TRANSLATIONS } from "@/constants/i18n";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { Language, TranslationKey } from "@/types/i18n";

type I18nContextValue = {
  language: Language;
  languageLabel: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "gu";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.language) : null;
    if (isLanguage(stored)) {
      // eslint-disable-next-line
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "gu" : "en"));
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const bundle = TRANSLATIONS[language];
      let text: string = bundle[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue));
        });
      }

      return text;
    },
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      languageLabel: LANGUAGE_LABELS[language],
      t,
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, t, toggleLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

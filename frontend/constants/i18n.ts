// Import all translation modules
import { navTranslations } from "./translations/nav";
import { heroTranslations } from "./translations/hero";
import { homeTranslations } from "./translations/home";
import { aboutTranslations } from "./translations/about";
import { authTranslations } from "./translations/auth";
import { chatbotTranslations } from "./translations/chatbot";
import { assessmentTranslations } from "./translations/assessment";
import { resourcesTranslations } from "./translations/resources";

// Merge all translations for each language
const mergeTranslations = (...translationObjects: Record<string, string>[]) => {
  return translationObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
};

export const translations = {
  en: mergeTranslations(
    navTranslations.en,
    heroTranslations.en,
    homeTranslations.en,
    aboutTranslations.en,
    authTranslations.en,
    chatbotTranslations.en,
    assessmentTranslations.en,
    resourcesTranslations.en
  ),
  gu: mergeTranslations(
    navTranslations.gu,
    heroTranslations.gu,
    homeTranslations.gu,
    aboutTranslations.gu,
    authTranslations.gu,
    chatbotTranslations.gu,
    assessmentTranslations.gu,
    resourcesTranslations.gu
  )
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;

// Default language
export const DEFAULT_LANGUAGE: Language = "en";

// Language labels for UI
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  gu: "ગુજરાતી"
};

// Export translations as TRANSLATIONS for backward compatibility
export const TRANSLATIONS = translations;

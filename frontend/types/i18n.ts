import { translations } from "@/constants/i18n";

export const LANGUAGES = ["en", "gu"] as const;

export type Language = (typeof LANGUAGES)[number];

export type TranslationKey = keyof typeof translations.en;


export type Translations = Record<TranslationKey, string>;

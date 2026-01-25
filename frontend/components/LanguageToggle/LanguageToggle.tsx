"use client";

import { useMemo } from "react";

import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/Button";

export function LanguageToggle() {
  const { language, toggleLanguage } = useI18n();

  const label = useMemo(() => (language === "en" ? "ગુજરાતી" : "English"), [language]);

  return (
    <Button type="button" variant="ghost" size="sm" onClick={toggleLanguage}>
      {label}
    </Button>
  );
}

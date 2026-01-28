"use client";

import React, { useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";

export function LanguageFontWrapper({ children }: { children: React.ReactNode }) {
    const { language } = useI18n();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Apply language-specific font class and lang attribute to body
        document.body.classList.remove("font-en", "font-gu");
        document.body.classList.add(`font-${language}`);
        document.documentElement.lang = language;
    }, [language]);

    return <>{children}</>;
}

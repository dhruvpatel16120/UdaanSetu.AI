"use client";

import { useI18n } from "@/hooks/useI18n";

export function AboutHero() {
  const { t } = useI18n();

  return (
    <section className="gradient-hero py-20 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          {t("about.heroTitle")}
        </h1>
        <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
          {t("about.heroDesc")}
        </p>
      </div>
    </section>
  );
}

"use client";

import { useI18n } from "@/hooks/useI18n";

export function ValuePropositions() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t("home.whyChooseUs")}
          </h2>
          <p className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto">
            {t("home.whyChooseUsDesc")}
          </p>
        </div>

        {/* Value Propositions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* AI Guidance */}
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-foreground font-bold text-xl mb-3">{t("hero.aiGuidance")}</h3>
            <p className="text-foreground/70 text-base leading-relaxed">{t("hero.aiGuidanceDesc")}</p>
          </div>

          {/* Multilingual */}
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-foreground font-bold text-xl mb-3">{t("hero.multilingual")}</h3>
            <p className="text-foreground/70 text-base leading-relaxed">{t("hero.multilingualDesc")}</p>
          </div>

          {/* Future Skills */}
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-foreground font-bold text-xl mb-3">{t("hero.futureSkills")}</h3>
            <p className="text-foreground/70 text-base leading-relaxed">{t("hero.futureSkillsDesc")}</p>
          </div>

          {/* Personalized */}
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-foreground font-bold text-xl mb-3">{t("hero.personalized")}</h3>
            <p className="text-foreground/70 text-base leading-relaxed">{t("hero.personalizedDesc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

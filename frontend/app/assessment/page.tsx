"use client";

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { BackendQASection } from "@/components/assessment/BackendQASection";
import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export default function AssessmentPage() {
  const { status } = useAuth();
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{t("assessment.loading")}</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 text-center border border-zinc-200 dark:border-zinc-700">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            {t("assessment.signInRequired")}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-6">
            {t("assessment.signInRequiredDesc")}
          </p>
          <Link
            href={ROUTES.auth.signIn} // Fixed: redirects to /auth/sign-in instead of /signin
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {t("assessment.signInToContinue")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      {/* Language toggle in top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <BackendQASection />
    </div>
  );
}

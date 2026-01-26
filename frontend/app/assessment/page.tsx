"use client";

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { ModernAssessment } from "@/components/assessment/ModernAssessment";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/store/theme/ThemeProvider";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ENV } from "@/constants/env";

export default function AssessmentPage() {
  const { status, user } = useAuth();
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if assessment already exists
  useEffect(() => {
    async function checkExisting() {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("retake") === "true") {
        setIsChecking(false);
        return;
      }

      if (status === "authenticated" && user) {
        try {
          const res = await fetch(`${ENV.apiUrl}/api/assessment/result/${user.uid}`);
          if (res.ok) {
            // Result exists, redirect
            router.push(ROUTES.assessmentResult);
            return;
          }
        } catch (e) {
          // Ignore error, proceed to assessment
        }
      }
      setIsChecking(false);
    }

    if (status === 'loading') return;
    checkExisting();
  }, [status, user, router]);

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-xl font-medium text-foreground/40 animate-pulse">{t("assessment.loading")}</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background ambience for unauthenticated state */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full glass-card p-10 text-center border-border shadow-2xl relative overflow-hidden bg-card/50"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />

          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 p-4">
            <Image
              src="/logo.png"
              alt="UdaanSetu Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-black text-foreground mb-4">
            {t("assessment.signInRequired")}
          </h1>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed font-medium">
            {t("assessment.signInRequiredDesc")}
          </p>
          <Link
            href={ROUTES.auth.signIn}
            className="inline-block w-full bg-accent hover:bg-accent/90 text-white font-black py-5 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/20"
          >
            {t("assessment.signInToContinue")}
          </Link>

          <div className="mt-8 pt-8 border-t border-border/50">
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest">
              {t("assessment.back")}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden transition-colors duration-500",
      theme === "dark" ? "bg-[#020617]" : "bg-white"
    )}>
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-500",
          theme === "dark" ? "bg-orange-500/10" : "bg-orange-500/5"
        )} />
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-500",
          theme === "dark" ? "bg-purple-900/10" : "bg-purple-500/5"
        )} />
      </div>

      <main className="relative z-10 w-full pt-20">
        <ModernAssessment />
      </main>
    </div>
  );
}

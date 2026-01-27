"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/store/theme/ThemeProvider";
import { ENV } from "@/constants/env";
import { ROUTES } from "@/constants/routes";
import { motion } from "framer-motion";

import {
  CheckCircle2,
  ArrowRight,
  Trophy,
  Target,
  Zap,
  Brain,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function AssessmentResultPage() {
  const { user, status } = useAuth();
  const { t, language } = useI18n();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    async function fetchResult() {
      try {
        // For demo/dev we use demo_user_123 if user.uid is not available
        const userId = user?.uid || "demo_user_123";
        const res = await fetch(`${ENV.apiUrl}/api/assessment/result/${userId}`);

        if (!res.ok) {
          if (res.status === 404) throw new Error("No assessment result found. Please complete the assessment first.");
          throw new Error("Failed to load results.");
        }

        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [user, status]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-xl font-medium animate-pulse text-muted-foreground">{t("assessment.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="glass-card p-8 max-w-md w-full text-center border-destructive/20">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">{t("assessment.missionHalted")}</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Link href={ROUTES.assessment}>
            <Button className="bg-accent text-white w-full rounded-full">
              {t("assessment.retryQuest")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from new standardized structure
  const bioData = result?.generated_bio || {};
  const readiness = bioData.readiness_score || 0;
  const traits = bioData.trait_scores || {};
  const snapshot = bioData.snapshot || {};
  const insights = snapshot.key_insights || [];
  const recommendation = snapshot.top_recommendation || "Pending Analysis";

  return (
    <div className={cn(
      "min-h-screen py-20 px-4 relative overflow-hidden",
      theme === "dark" ? "bg-[#020617]" : "bg-zinc-50"
    )}>
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-3 bg-accent/10 rounded-2xl mb-6">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            {t("assessment.journeyComplete")}
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            {t("assessment.blueprintReady")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 bg-card border-border flex flex-col items-center justify-center overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-32 h-32 text-accent" />
            </div>
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 88}
                  initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - readiness / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-accent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-foreground">{readiness}%</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Readiness</span>
              </div>
            </div>

            {/* Sub Scores */}
            <div className="w-full grid grid-cols-2 gap-4 mt-4 text-center">
              {Object.entries(traits).slice(0, 6).map(([key, val]: any) => (
                <div key={key} className="flex flex-col items-center justify-center p-2 bg-muted/20 rounded-lg">
                  <span className="text-lg font-black text-foreground">{val}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate w-full">
                    {key.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-10 bg-card border-border relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Brain className="w-32 h-32 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Target className="w-6 h-6 text-accent" /> Key Insights
            </h3>
            <div className="space-y-6 flex-grow">
              {insights.map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-lg font-medium text-foreground/80 leading-tight">{insight}</span>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-muted-foreground italic">AI analysis in progress...</p>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-border">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Top Recommendation</p>
              <div className="text-2xl font-black text-accent leading-tight">
                {recommendation}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href={ROUTES.profile} className="w-full sm:w-auto">
            <Button className="w-full bg-accent hover:bg-accent/90 text-white font-black py-6 px-10 rounded-2xl text-lg shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95">
              Generate Bio-Profile <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          <Link href={`${ROUTES.assessment}?retake=true`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-2xl py-6 px-10 border-border text-foreground/60 hover:text-foreground hover:bg-muted font-bold transition-all">
              Retake Assessment
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

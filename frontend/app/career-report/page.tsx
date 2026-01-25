"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/store/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export default function CareerReportPage() {
  const { user, status } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      // In a real app, use the actual user ID from the auth context
      // For now, using the hardcoded demo ID
      const userId = "demo_user_123";
      try {
        const response = await fetch(
          `http://localhost:8000/api/assessment/report/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            data.generatedAt = new Date(); // Fallback date
            setReportData(data);
          } else {
            setError("Report is being generated or not found.");
          }
        } else {
          setError("Report not found. Please complete the assessment.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchReport();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-primary-indigo/20 border-t-transparent rounded-full animate-spin animation-delay-200"></div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5">
        <div className="glass-card p-12 text-center max-w-md mx-4 animate-in-scale">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-foreground/70 mb-6">
            Please sign in to view your career report.
          </p>
          <Link href="/auth?mode=sign-in">
            <Button className="bg-gradient-to-r from-accent to-orange-600">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-primary-indigo/20 border-t-transparent rounded-full animate-spin animation-delay-200"></div>
        </div>
        <p className="absolute mt-32 text-foreground/60 animate-pulse">
          Analyzing your profile...
        </p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5">
        <div className="glass-card p-12 text-center max-w-md mx-4 animate-in-scale">
          <div className="text-red-500 mb-4 h-12 w-12 mx-auto flex items-center justify-center bg-red-100 rounded-full">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
          <p className="text-foreground/70 mb-6">
            {error || "Please complete the assessment first."}
          </p>
          <Link href="/assessment">
            <Button className="bg-gradient-to-r from-accent to-orange-600">
              Go to Assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-indigo/5 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card p-6 mb-8 animate-in-scale">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-indigo via-accent to-teal bg-clip-text text-transparent">
                Your Career Report
              </h1>
              <p className="text-foreground/60" suppressHydrationWarning>
                Generated on{" "}
                {mounted &&
                  reportData.generatedAt.toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="glass-card p-8 mb-8 animate-in-scale animation-delay-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">👤</span>
            Profile Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Career Readiness */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-foreground/10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - reportData.careerReadiness / 100)}`}
                    className="text-accent transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {reportData.careerReadiness}%
                  </span>
                </div>
              </div>
              <p className="font-semibold text-lg">Career Readiness</p>
            </div>

            {/* Top Strengths */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-accent">
                Top Strengths
              </h3>
              <div className="space-y-2">
                {reportData.topStrengths.map((strength, index) => (
                  <div
                    key={strength}
                    className="flex items-center gap-2 animate-in-scale"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-foreground/80">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality Traits */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-primary-indigo">
                Personality Traits
              </h3>
              <div className="space-y-2">
                {reportData.personalityTraits.map((trait, index) => (
                  <div
                    key={trait}
                    className="px-3 py-2 bg-primary-indigo/10 rounded-lg border border-primary-indigo/20 text-sm animate-in-scale"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {trait}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Career Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            Recommended Career Paths
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportData.recommendations.map((career, index) => (
              <div
                key={career.title}
                className={cn(
                  "glass-card p-6 animate-in-scale",
                  `animation-delay-${(index + 1) * 100}`,
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{career.title}</h3>
                  <div className="px-3 py-1 bg-gradient-to-r from-accent/20 to-orange-600/20 rounded-full border border-accent/30 text-sm font-bold text-accent">
                    {career.match}%
                  </div>
                </div>
                <p className="text-foreground/70 text-sm mb-4">
                  {career.description}
                </p>
                <div className="border-t border-foreground/10 pt-4">
                  <p className="text-xs font-semibold text-foreground/50 mb-2">
                    Requirements:
                  </p>
                  <div className="space-y-1">
                    {career.requirements.map((req) => (
                      <div
                        key={req}
                        className="flex items-center gap-2 text-sm text-foreground/70"
                      >
                        <svg
                          className="w-4 h-4 text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Skills */}
          <div className="glass-card p-6 animate-in-scale">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Current Skills
            </h3>
            <div className="space-y-4">
              {reportData.currentSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="animate-in-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className="text-sm font-bold text-accent">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-foreground/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent to-orange-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Skills */}
          <div className="glass-card p-6 animate-in-scale animation-delay-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              Skills to Develop
            </h3>
            <div className="space-y-3">
              {reportData.recommendedSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className={cn(
                    "px-4 py-3 rounded-lg border flex items-center justify-between animate-in-scale",
                    skill.priority === "high"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-yellow-500/10 border-yellow-500/30",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="font-medium">{skill.name}</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold uppercase",
                      skill.priority === "high"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                    )}
                  >
                    {skill.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Pathways */}
        <div className="glass-card p-8 mb-8 animate-in-scale">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Learning Pathways
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData.learningPaths.map((path, index) => (
              <div
                key={path.title}
                className={cn(
                  "p-6 bg-gradient-to-br from-primary-indigo/5 to-teal/5 rounded-2xl border border-foreground/10 animate-in-scale",
                  `animation-delay-${(index + 1) * 100}`,
                )}
              >
                <h3 className="font-bold text-lg mb-2">{path.title}</h3>
                <p className="text-sm text-foreground/60 mb-4">
                  Duration: {path.duration}
                </p>
                <div className="space-y-2">
                  {path.resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      className="flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Short Term Goals */}
          <div className="glass-card p-6 animate-in-scale">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Short-Term Goals (1-3 months)
            </h3>
            <div className="space-y-3">
              {reportData.actionPlan.shortTerm.map((goal, index) => (
                <div
                  key={goal}
                  className="flex items-start gap-3 animate-in-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                  </div>
                  <p className="text-foreground/80">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Long Term Goals */}
          <div className="glass-card p-6 animate-in-scale animation-delay-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Long-Term Goals (6-12 months)
            </h3>
            <div className="space-y-3">
              {reportData.actionPlan.longTerm.map((goal, index) => (
                <div
                  key={goal}
                  className="flex items-start gap-3 animate-in-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary-indigo/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-primary-indigo"></div>
                  </div>
                  <p className="text-foreground/80">{goal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-card p-8 text-center bg-gradient-to-r from-primary-indigo/5 via-accent/5 to-teal/5 border-2 border-accent/20 animate-in-scale">
          <h2 className="text-2xl font-bold mb-3">Need Guidance?</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Chat with our AI mentor to get personalized advice, clarify your
            career path, and discuss specific challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.mentor}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-transform shadow-lg"
              >
                Chat with Mentor
              </Button>
            </Link>
            <Link href={ROUTES.resources}>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-indigo text-primary-indigo hover:bg-primary-indigo/10"
              >
                Explore Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

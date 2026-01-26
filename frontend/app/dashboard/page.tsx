"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/store/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export default function DashboardPage() {
  const { user, status } = useAuth();
  const { t } = useI18n();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-foreground/70 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/auth?mode=sign-in">
            <Button className="bg-gradient-to-r from-accent to-orange-600">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'User';
  const userInitial = userName[0].toUpperCase();

  // Mock data - Replace with actual API calls
  const stats = {
    assessmentsCompleted: 1,
    profileCompletion: 75,
    skillsIdentified: 8,
    hoursLearned: 12
  };

  const quickActions = [
    {
      title: "Take Assessment",
      description: "Discover your career path",
      icon: "📋",
      href: ROUTES.assessment,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Assessment Results",
      description: "View your profile & results",
      icon: "📊",
      href: ROUTES.assessmentResult,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "AI Mentor",
      description: "Chat with career mentor",
      icon: "🤖",
      href: ROUTES.mentor,
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      title: "Career Report",
      description: "Detailed career insights",
      icon: "📈",
      href: ROUTES.careerReport,
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const careerInsights = {
    topSkills: ["Communication", "Problem Solving", "Digital Literacy"],
    suggestedPaths: ["Software Development", "Digital Marketing", "Data Analysis"],
    nextSteps: ["Complete skill assessment", "Explore learning resources", "Connect with mentors"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-indigo/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="glass-card p-8 mb-8 animate-in-scale">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {userInitial}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  Welcome back, {userName}!
                </h1>
                <p className="text-foreground/60" suppressHydrationWarning>
                  {mounted && new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={ROUTES.profile}>
                <Button variant="outline" size="sm">View Profile</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 animate-in-scale animation-delay-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">Assessments</h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.assessmentsCompleted}</p>
            <p className="text-xs text-foreground/50 mt-1">Completed</p>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">Profile</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.profileCompletion}%</p>
            <div className="w-full bg-foreground/10 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-accent to-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">Skills</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.skillsIdentified}</p>
            <p className="text-xs text-foreground/50 mt-1">Identified</p>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-400">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">Learning</h3>
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.hoursLearned}h</p>
            <p className="text-xs text-foreground/50 mt-1">This month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href}>
                <div
                  className={cn(
                    "glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-in-scale border border-foreground/10",
                    `animation-delay-${(index + 1) * 100}`
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                    <div className={cn(
                      "w-10 h-10 rounded-full bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity",
                      action.gradient
                    )}></div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-foreground/60">{action.description}</p>
                  <div className="mt-4 flex items-center text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Get Started
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Career Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Skills */}
          <div className="glass-card p-6 animate-in-scale">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="text-lg font-semibold">Top Skills</h3>
            </div>
            <div className="space-y-2">
              {careerInsights.topSkills.map((skill, index) => (
                <div
                  key={skill}
                  className="px-3 py-2 bg-gradient-to-r from-accent/10 to-orange-600/10 rounded-lg border border-accent/20 text-sm animate-in-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Career Paths */}
          <div className="glass-card p-6 animate-in-scale animation-delay-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚀</span>
              <h3 className="text-lg font-semibold">Career Paths</h3>
            </div>
            <div className="space-y-2">
              {careerInsights.suggestedPaths.map((path, index) => (
                <div
                  key={path}
                  className="px-3 py-2 bg-gradient-to-r from-primary-indigo/10 to-primary-navy/10 rounded-lg border border-primary-indigo/20 text-sm animate-in-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {path}
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="glass-card p-6 animate-in-scale animation-delay-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📌</span>
              <h3 className="text-lg font-semibold">Next Steps</h3>
            </div>
            <div className="space-y-3">
              {careerInsights.nextSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-2 animate-in-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                  </div>
                  <p className="text-sm text-foreground/80">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-card p-8 text-center bg-gradient-to-r from-primary-indigo/5 via-accent/5 to-teal/5 border-2 border-accent/20 animate-in-scale">
          <h2 className="text-2xl font-bold mb-3">Ready to take the next step?</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Complete your career assessment to unlock personalized recommendations and connect with opportunities tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.assessment}>
              <Button size="lg" className="bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-transform shadow-lg">
                Start Assessment
              </Button>
            </Link>
            <Link href={ROUTES.mentor}>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                Talk to Mentor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

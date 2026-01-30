"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import {
  UserCheck,
  Target,
  Briefcase,
  MapPin,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  FileText
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useProfile, useAssessmentResult, useCareerReport } from "@/hooks/useUserData";

export default function DashboardPage() {
  const { user, status } = useAuth();
  const { language, t } = useI18n();
  const [formattedDate, setFormattedDate] = useState("");
  const { data: profileData } = useProfile();
  const { data: assessmentData, isLoading: loadingAssessment } = useAssessmentResult(user?.uid);
  const { data: reportData, isLoading: loadingReport } = useCareerReport(user?.uid);

  useEffect(() => {
    // Avoid synchronous setState in effect body to satisfy lint and performance
    const dateStr = new Date().toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    const timer = setTimeout(() => {
      setFormattedDate(dateStr);
    }, 0);
    return () => clearTimeout(timer);
  }, [language]);

  // Use toast for data errors
  useEffect(() => {
    if (status === "authenticated" && !loadingAssessment && !assessmentData && !loadingReport && !reportData) {
       toast.error(t("dashboard.dataUnavailable"));
    }
  }, [assessmentData, reportData, loadingAssessment, loadingReport, status, t]);

  const loadingData = loadingAssessment || loadingReport;


  if (status === "loading" || (status === "authenticated" && loadingData)) {
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
          <h1 className="text-2xl font-bold mb-4">{t("report.accessDenied")}</h1>
          <p className="text-foreground/70 mb-6">{t("report.signInToView")}</p>
          <Link href="/auth?mode=sign-in">
            <Button className="bg-gradient-to-r from-accent to-orange-600">{t("auth.action.signIn")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // === OPTIMIZED DATA EXTRACTION ===
  // Get user name from multiple sources
  // Helper to safely extract text from Bilingual objects
  const getText = (val: string | { en?: string; gu?: string } | null | undefined): string => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    const result = language === 'gu' ? (val.gu || val.en) : (val.en || val.gu);
    return result || "";
  };

  const rawName = 
    profileData?.displayName || 
    profileData?.name || 
    assessmentData?.analysis?.basic_info?.name ||
    user.displayName || 
    user.email?.split('@')[0] || 
    t("dashboard.explorer");

  const userName = getText(rawName);
  const userInitial = userName ? userName[0].toUpperCase() : "U";
  


  // Derived Stats
  const hasAssessment = !!assessmentData && assessmentData.status === "complete";
  const hasReport = !!reportData && Object.keys(reportData).length > 0;
  
  // Profile completion calculation
  const profileCompletion = [
    profileData?.name || profileData?.displayName,
    profileData?.profile?.education || assessmentData?.analysis?.basic_info?.education,
    profileData?.profile?.location || assessmentData?.analysis?.basic_info?.location,
    hasAssessment
  ].filter(Boolean).length * 25;

  // === EXTRACT CAREER DATA ===
  // Top career match - check multiple data paths
  const topCareer = getText(
    reportData?.recommendations?.[0]?.title ||
    assessmentData?.analysis?.career_paths?.[0]?.title ||
    assessmentData?.generated_bio?.snapshot?.top_recommendation
  );

  // Skills extraction
  const topSkills = 
    reportData?.topStrengths ||
    assessmentData?.analysis?.top_skills_recommended ||
    assessmentData?.analysis?.user_current_skills ||
    [];

  // Career paths
  const recommendedPaths = 
    assessmentData?.analysis?.career_paths?.map((p) => p.title) ||
    [];



  const quickActions = [
    {
      title: hasAssessment ? t("dashboard.retakeAssessment") : t("dashboard.startAssessment"),
      description: hasAssessment ? t("dashboard.updateCareerPath") : t("dashboard.discoverCareerPath"),
      icon: <FileText className="w-6 h-6" />,
      href: ROUTES.assessment,
      gradient: "from-blue-500 to-indigo-600",
      cta: hasAssessment ? t("dashboard.retake") : t("dashboard.startNow")
    },
    {
      title: t("dashboard.viewReport"),
      description: hasReport ? t("dashboard.detailedAnalysis") : t("dashboard.completeFirst"),
      icon: <TrendingUp className="w-6 h-6" />,
      href: hasReport ? ROUTES.careerReport : ROUTES.assessment,
      gradient: "from-purple-500 to-pink-600",
      cta: t("dashboard.viewInsights"),
      disabled: !hasReport && !hasAssessment
    },
    {
      title: t("dashboard.aiMentor"),
      description: t("dashboard.chatWithCoach"),
      icon: <BrainCircuit className="w-6 h-6" />,
      href: ROUTES.mentor,
      gradient: "from-teal-500 to-cyan-600",
      cta: t("dashboard.chatNow")
    },
    {
      title: t("dashboard.updateProfile"),
      description: t("dashboard.keepInfoCurrent"),
      icon: <UserCheck className="w-6 h-6" />,
      href: ROUTES.profile,
      gradient: "from-orange-500 to-red-600",
      cta: t("dashboard.editProfile")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-indigo/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="glass-card p-8 mb-8 animate-in-scale relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={userName}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.3)] border-4 border-background object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] border-4 border-background">
                  {userInitial}
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  {t("dashboard.welcome")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">{userName}</span>!
                </h1>
                 <p className="text-foreground/60 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {profileData?.profile?.location || "Gujarat, India"} • {formattedDate}
                 </p>
              </div>
            </div>
            
            <div className="flex gap-4">
               {hasReport && (
                 <Link href={ROUTES.careerReport}>
                  <Button className="bg-background text-foreground hover:bg-foreground/90 font-semibold shadow-lg">
                    {t("dashboard.viewFullReport")}
                  </Button>
                 </Link>
               )}
            </div>  
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 animate-in-scale animation-delay-100 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">{t("dashboard.status")}</h3>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {hasAssessment ? t("dashboard.active") : t("dashboard.pending")}
            </p>
            <p className="text-xs text-foreground/50 mt-1">{t("dashboard.status")}</p>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-200 hover:shadow-lg transition-shadow border-l-4 border-l-accent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">{t("dashboard.profile")}</h3>
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{profileCompletion}%</p>
            <div className="w-full bg-foreground/10 rounded-full h-1.5 mt-3">
              <div
                className="bg-accent h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-300 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">{t("dashboard.topMatch")}</h3>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground line-clamp-1">
              {topCareer || "N/A"}
            </p>
            <p className="text-xs text-foreground/50 mt-1">{t("dashboard.primaryPath")}</p>
          </div>

          <Link href={ROUTES.mentor} className="glass-card p-6 animate-in-scale animation-delay-400 hover:shadow-lg hover:scale-[1.02] transition-all border-l-4 border-l-blue-500 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">{t("dashboard.aiMentor")}</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{t("dashboard.chatNow")}</p>
            <p className="text-xs text-foreground/50 mt-1">{t("dashboard.getGuidance")}</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full"></span>
            {t("dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href} onClick={(e) => action.disabled && e.preventDefault()}>
                <div
                  className={cn(
                    "glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-in-scale relative overflow-hidden",
                    `animation-delay-${(index + 1) * 100}`,
                     action.disabled && "opacity-60 grayscale cursor-not-allowed hover:scale-100"
                  )}
                >
                   <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20 bg-gradient-to-br", action.gradient)} />
                   
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("p-3 rounded-xl text-white shadow-lg bg-gradient-to-br group-hover:scale-110 transition-transform duration-300", action.gradient)}>
                      {action.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1">{action.title}</h3>
                  <p className="text-sm text-foreground/60 mb-4 h-10">{action.description}</p>
                  
                  <div className={cn("flex items-center text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r", action.gradient)}>
                     {action.cta}
                    <svg className="w-4 h-4 ml-1 text-foreground/50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Career Insights Section - Only Show if Data Exists */}
        {hasReport && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Top Skills */}
            <div className="glass-card p-8 animate-in-scale relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-transparent"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                  <h3 className="text-xl font-bold">{t("dashboard.topSkills")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topSkills.length > 0 ? (
                    topSkills.slice(0, 6).map((skill: string, index: number) => (
                    <div
                        key={index}
                        className="px-4 py-2 bg-accent/5 hover:bg-accent/10 rounded-full border border-accent/20 text-sm font-medium transition-colors animate-in-scale"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {skill}
                    </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">{t("dashboard.noSkills")}</p>
                )}
              </div>
            </div>

            {/* Suggested Career Paths */}
            <div className="glass-card p-8 animate-in-scale lg:col-span-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-indigo/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-primary-indigo/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary-indigo" />
                </div>
                  <h3 className="text-xl font-bold">{t("dashboard.recommendedPaths")}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                {recommendedPaths.length > 0 ? (
                    recommendedPaths.slice(0, 4).map((path: string, index: number) => (
                    <div
                        key={index}
                        className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between hover:border-primary-indigo/50 transition-colors group"
                    >
                        <span className="font-medium">{path}</span>
                         <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <TrendingUp className="w-4 h-4 text-primary-indigo" />
                         </div>
                    </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">{t("dashboard.completeToSeePaths")}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section for incomplete assessment */}
        {!hasReport && !hasAssessment && status === "authenticated" && !loadingData && (
          <div className="glass-card p-10 text-center bg-gradient-to-r from-primary-indigo/10 via-accent/5 to-teal/10 border-2 border-accent/20 animate-in-scale shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
            
            <h2 className="text-3xl font-black mb-4 tracking-tight">{t("dashboard.futureAwaits")}</h2>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("dashboard.unlockRoadmap")}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href={ROUTES.assessment}>
                <Button size="lg" className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-transform shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                   {t("dashboard.startDiscovery")} <div className="ml-2 bg-white/20 p-1 rounded-full"><TrendingUp className="w-4 h-4"/></div>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

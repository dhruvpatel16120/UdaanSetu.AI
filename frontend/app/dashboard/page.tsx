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
import { ENV } from "@/constants/env";
import {
  FileText,
  UserCheck,
  Target,
  Clock,
  Briefcase,
  MapPin,
  TrendingUp,
  BrainCircuit,
  GraduationCap
} from "lucide-react";

export default function DashboardPage() {
  const { user, status } = useAuth();
  const { t } = useI18n();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch User Profile
      const profileRes = await fetch(`${ENV.apiUrl}/api/user/me`, {
        headers: { "X-Firebase-Id": user?.uid || "" }
      });
      if (profileRes.ok) {
        setProfileData(await profileRes.json());
      }

      // 2. Fetch Assessment Result (if any)
      const assessmentRes = await fetch(`${ENV.apiUrl}/api/assessment/result/${user?.uid}`);
      if (assessmentRes.ok) {
        setAssessmentData(await assessmentRes.json());
      }

      // 3. Fetch Career Report (if any)
      const reportRes = await fetch(`${ENV.apiUrl}/api/assessment/report/${user?.uid}`);
      if (reportRes.ok) {
        setReportData(await reportRes.json());
      }

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoadingData(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-foreground/70 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/auth?mode=sign-in">
            <Button className="bg-gradient-to-r from-accent to-orange-600">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userName = profileData?.name || user.displayName || user.email?.split('@')[0] || 'Explorer';
  const userInitial = userName[0].toUpperCase();

  // Derived Stats
  const hasAssessment = !!assessmentData;
  const hasReport = !!reportData;
  const profileCompletion = [
    profileData?.name,
    profileData?.profile?.education,
    profileData?.profile?.location,
    hasAssessment
  ].filter(Boolean).length * 25;

  const quickActions = [
    {
      title: hasAssessment ? "Retake Assessment" : "Start Assessment",
      description: hasAssessment ? "Update your career path" : "Discover your career path",
      icon: <FileText className="w-6 h-6" />,
      href: ROUTES.assessment,
      gradient: "from-blue-500 to-indigo-600",
      cta: hasAssessment ? "Retake" : "Start Now"
    },
    {
      title: "View Report",
      description: hasReport ? "Detailed analysis ready" : "Complete assessment first",
      icon: <TrendingUp className="w-6 h-6" />,
      href: hasReport ? ROUTES.careerReport : ROUTES.assessment,
      gradient: "from-purple-500 to-pink-600",
      cta: "View Insights",
      disabled: !hasReport && !hasAssessment
    },
    {
      title: "AI Mentor",
      description: "Chat with your career coach",
      icon: <BrainCircuit className="w-6 h-6" />,
      href: ROUTES.mentor,
      gradient: "from-teal-500 to-cyan-600",
      cta: "Chat Now"
    },
    {
      title: "Update Profile",
      description: "Keep your info current",
      icon: <UserCheck className="w-6 h-6" />,
      href: ROUTES.profile,
      gradient: "from-orange-500 to-red-600",
      cta: "Edit Profile"
    }
  ];

  // Safely extract career insights
  const generatedCareer = reportData?.careers?.[0]; // Access first career suggestion if available
  const topSkills = reportData?.analysis?.skills || [];
  const recommendedPaths = reportData?.careers?.map((c: any) => c.title) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-indigo/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="glass-card p-8 mb-8 animate-in-scale relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] border-4 border-background">
                {userInitial}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">{userName}</span>!
                </h1>
                <p className="text-foreground/60 flex items-center gap-2" suppressHydrationWarning>
                   <MapPin className="w-4 h-4" /> {profileData?.profile?.location || "Gujarat, India"} • {mounted && new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
               {hasReport && (
                 <Link href={ROUTES.careerReport}>
                  <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg">
                    View Full Report
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
              <h3 className="text-sm font-medium text-foreground/60">Status</h3>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {hasAssessment ? "Active" : "Pending"}
            </p>
            <p className="text-xs text-foreground/50 mt-1">Assessment Status</p>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-200 hover:shadow-lg transition-shadow border-l-4 border-l-accent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">Profile</h3>
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
              <h3 className="text-sm font-medium text-foreground/60">Top Match</h3>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground line-clamp-1">
              {generatedCareer?.title || "N/A"}
            </p>
            <p className="text-xs text-foreground/50 mt-1">Primary Career Path</p>
          </div>

          <div className="glass-card p-6 animate-in-scale animation-delay-400 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground/60">Learning</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">0h</p>
            <p className="text-xs text-foreground/50 mt-1">Time Invested</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full"></span>
            Quick Actions
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
                <h3 className="text-xl font-bold">Your Top Skills</h3>
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
                    <p className="text-muted-foreground">No skills analyzed yet.</p>
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
                <h3 className="text-xl font-bold">Recommended Career Paths</h3>
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
                    <p className="text-muted-foreground">Complete the assessment to see career paths.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section for incomplete assessment */}
        {!hasReport && !hasAssessment && status === "authenticated" && !loadingData && (
          <div className="glass-card p-10 text-center bg-gradient-to-r from-primary-indigo/10 via-accent/5 to-teal/10 border-2 border-accent/20 animate-in-scale shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
            
            <h2 className="text-3xl font-black mb-4 tracking-tight">Your Future Awaits!</h2>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Unlock your personalized career roadmap by completing our AI-powered assessment. It only takes a few minutes to discover your true potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href={ROUTES.assessment}>
                <Button size="lg" className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-transform shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                   Start Discovery Now <div className="ml-2 bg-white/20 p-1 rounded-full"><TrendingUp className="w-4 h-4"/></div>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

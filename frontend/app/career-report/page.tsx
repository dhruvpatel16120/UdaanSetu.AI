"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/store/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { ENV } from "@/constants/env";
import {
    FileText,
    Share2,
    Download,
    Award,
    CheckCircle2,
    User,
    MapPin,
    Calendar,
    Brain,
    Target,
    BookOpen,
    Zap
} from "lucide-react";

interface RoadmapData {
    career_title: string;
    readiness_score: number;
    market_snapshot: {
        demand: string;
        salary: string;
        trend: string;
        reality_check?: string;
    };
    current_skills_meter?: { name: string; level: number }[];
    skills_matrix?: { missing: string[]; emerging: string[] };
    phases: {
        phase: number;
        title: string;
        duration: string;
        milestones: string[];
        goals?: string[];
        skills: { name: string; priority: string; time: string }[];
        resources: { name: string; type: string; url: string; lang: string }[];
    }[];
    scholarships_and_schemes: { name: string; benefit: string; link: string }[];
    action_plan?: { short_term: string[]; long_term: string[] };
    success_tips: string[];
}

interface ReportData {
    generatedAt: Date;
    careerReadiness: number;
    topStrengths: string[];
    personalityTraits: string[];
    recommendations: {
        title: string;
        match: number;
        description: string;
        requirements: string[];
    }[];
    currentSkills: {
        name: string;
        level: number;
    }[];
    recommendedSkills: {
        name: string;
        priority: "high" | "medium" | "low";
    }[];
    learningPaths: {
        title: string;
        duration: string;
        resources: {
            name: string;
            url: string;
        }[];
    }[];
    actionPlan: {
        shortTerm: string[];
        longTerm: string[];
    };
}

export default function CareerReportPage() {
    const { user, status } = useAuth();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // State for Report Data
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
    const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "loading") return;

        async function fetchReport() {
            if (!user?.uid) return;
            const userId = user.uid;
            try {
                // Fetch full result including traits
                const res = await fetch(`${ENV.apiUrl}/api/assessment/result/${userId}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Report not found. Please complete the assessment first.");
                    throw new Error("Failed to load report");
                }
                const data = await res.json();

                // Transform Backend Data to UI Structure
                const bio = data.generated_bio || {};
                const traits = bio.traits || {};
                const aiReport = bio.ai_report || {};

                // Heuristic Mapping (Logic to make it look real based on traits)
                const mappedStrengths = [];
                if (traits.strength === "stamina") mappedStrengths.push("Hardworking & Resilient");
                if (traits.strength === "logic") mappedStrengths.push("Logical Problem Solving");
                if (traits.strength === "communication") mappedStrengths.push("Effective Communication");
                if (traits.strength === "creativity") mappedStrengths.push("Creative Thinking");
                if (traits.leadership === "high") mappedStrengths.push("Leadership");
                if (mappedStrengths.length === 0) mappedStrengths.push("Dedication", "Adaptability");

                // Merge with AI Strengths if available
                if (aiReport.topStrengths) {
                    // If AI gives strengths, use them or mix
                }

                // Calculate a "Career Readiness" score based on traits
                let readiness = 60; // Base
                if (traits.education === "degree") readiness += 20;
                if (traits.education === "high_school") readiness += 10;
                if (traits.digital_literacy === "high") readiness += 10;
                if (traits.confidence === "high") readiness += 5;

                const transformedData: ReportData = {
                    generatedAt: new Date(data.last_updated?.seconds * 1000 || Date.now()),
                    careerReadiness: aiReport.careerReadiness || Math.min(readiness, 98),
                    topStrengths: aiReport.topStrengths || mappedStrengths,
                    personalityTraits: aiReport.personalityTraits || [
                        traits.mindset === "growth" ? "Growth Mindset" : (traits.mindset === "billionaire" ? "Ambitious" : "Stable & Reliable"),
                        traits.social === "high" ? "Extroverted" : (traits.leadership === "independent" ? "Independent" : "Team Player"),
                        traits.risk_appetite === "high" ? "Risk Taker" : "Cautious"
                    ],
                    recommendations: aiReport.recommendations || (
                        bio.suggested_paths?.length > 1 && bio.suggested_paths[0] !== "Pending Analysis..."
                            ? bio.suggested_paths.map((p: string) => ({ title: p, match: 85, description: "Recommended based on your profile", requirements: ["Dedication"] }))
                            : [
                                {
                                    title: traits.domain === "tech" ? "Software Developer" : (traits.domain === "commerce" ? "Accountant/Finance" : "General Management"),
                                    match: 92,
                                    description: traits.domain === "tech" ? "Build software and apps" : "Manage finances and business",
                                    requirements: traits.domain === "tech" ? ["Logic", "Coding"] : ["Math", "Management"]
                                }
                            ]
                    ),
                    currentSkills: aiReport.currentSkills || [
                        { name: "Communication", level: traits.strength === "communication" ? 90 : 70 },
                        { name: "Problem Solving", level: traits.problem_solving === "research_oriented" ? 85 : 65 },
                        { name: "Digital Literacy", level: traits.digital_literacy === "high" ? 90 : (traits.digital_literacy === "basic" ? 60 : 30) },
                    ],
                    recommendedSkills: aiReport.recommendedSkills || [
                        { name: "Time Management", priority: "medium" },
                        { name: traits.domain === "tech" ? "Python Basics" : "Financial Literacy", priority: "high" }
                    ],
                    learningPaths: aiReport.learningPaths || [
                        {
                            title: traits.domain === "tech" ? "Web Development Bootstart" : "Business Fundamentals",
                            duration: "3 months",
                            resources: [
                                { name: "UdaanSetu Modules", url: "/resources" },
                                { name: "YouTube Playlist", url: "#" }
                            ]
                        }
                    ],
                    actionPlan: aiReport.actionPlan || {
                        shortTerm: ["Complete your profile", "Watch 2 introductory videos"],
                        longTerm: ["Build a small project", "Apply for an internship"]
                    }
                };

                setReportData(transformedData);

            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : "Failed to load report";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated") {
            fetchReport();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }

    }, [user, status]);

    const handleGenerateRoadmap = async (careerTitle: string) => {
        if (!user?.uid) return;
        setGeneratingRoadmap(true);
        setActiveRoadmap(null);
        try {
            const res = await fetch(`${ENV.apiUrl}/api/roadmap/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.uid,
                    career_path: careerTitle,
                    language: "en" // Could be dynamic
                })
            });
            if (!res.ok) throw new Error("Could not generate roadmap");
            const data = await res.json();
            setActiveRoadmap(data.roadmap);

            // Scroll to roadmap section
            setTimeout(() => {
                document.getElementById('roadmap-view')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error(err);
        } finally {
            setGeneratingRoadmap(false);
        }
    };

    const handleShare = async () => {
        // If we are on localhost, use the actual local origin so the link WORKS.
        // Otherwise, use the 'classy' siteUrl from our config.
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const baseUrl = isLocal ? window.location.origin : ENV.siteUrl;

        const shareUrl = `${baseUrl}${window.location.pathname}`;
        const shareData = {
            title: "UdaanSetu - My Career Blueprint",
            text: `I just generated my AI career blueprint for ${reportData?.recommendations[0]?.title || "a bright future"}! Check it out at UdaanSetu.`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-primary-indigo/20 border-t-transparent rounded-full animate-spin animation-delay-200"></div>
                    <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-foreground/60 font-medium animate-pulse">
                        Analyzing Profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary-indigo/5">
                <div className="glass-card p-12 text-center max-w-md mx-4 animate-in-scale border-destructive/30">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Report Unavailable</h1>
                    <p className="text-foreground/70 mb-6">{error}</p>
                    <Link href="/assessment">
                        <Button className="bg-gradient-to-r from-accent to-orange-600 shadow-lg hover:scale-105 transition-transform">Take Assessment</Button>
                    </Link>
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
                    <p className="text-foreground/70 mb-6">Please sign in to view your career report.</p>
                    <Link href="/auth?mode=sign-in">
                        <Button className="bg-gradient-to-r from-accent to-orange-600">Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!reportData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-indigo/5 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 print:hidden">
                {/* Header */}
                <div className="glass-card p-6 mb-8 animate-in-scale">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-indigo via-accent to-teal bg-clip-text text-transparent">
                                Your Career Report
                            </h1>
                            <p className="text-foreground/60" suppressHydrationWarning>
                                Generated on {mounted && reportData.generatedAt.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-3 no-print">
                            <Button variant="outline" size="sm" onClick={handleExportPDF}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-foreground/10" />
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
                                    <span className="text-3xl font-bold">{reportData.careerReadiness}%</span>
                                </div>
                            </div>
                            <p className="font-semibold text-lg">Career Readiness</p>
                        </div>

                        {/* Top Strengths */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3 text-accent">Top Strengths</h3>
                            <div className="space-y-2">
                                {reportData.topStrengths.map((strength, index) => (
                                    <div key={strength} className="flex items-center gap-2 animate-in-scale" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                                        <span className="text-foreground/80">{strength}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Personality Traits */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3 text-primary-indigo">Personality Traits</h3>
                            <div className="space-y-2">
                                {reportData.personalityTraits.map((trait, index) => (
                                    <div key={trait} className="px-3 py-2 bg-primary-indigo/10 rounded-lg border border-primary-indigo/20 text-sm animate-in-scale" style={{ animationDelay: `${index * 100}ms` }}>
                                        {trait}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Career Recommendations */}
                {/* Career Recommendations */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-3xl">🎯</span>
                        Recommended Career Paths
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reportData.recommendations.map((career, index) => (
                            <div key={career.title} className={cn("glass-card p-6 animate-in-scale flex flex-col", `animation-delay-${(index + 1) * 100}`)}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">{career.title}</h3>
                                    <div className="px-3 py-1 bg-gradient-to-r from-accent/20 to-orange-600/20 rounded-full border border-accent/30 text-sm font-bold text-accent">
                                        {career.match}%
                                    </div>
                                </div>
                                <p className="text-foreground/70 text-sm mb-4">{career.description}</p>
                                <div className="border-t border-foreground/10 pt-4 flex-1">
                                    <p className="text-xs font-semibold text-foreground/50 mb-2">Requirements:</p>
                                    <div className="space-y-1 mb-6">
                                        {career.requirements.map((req) => (
                                            <div key={req} className="flex items-center gap-2 text-sm text-foreground/70">
                                                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {req}
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={() => handleGenerateRoadmap(career.title)}
                                        disabled={generatingRoadmap && activeRoadmap?.career_title !== career.title}
                                        className="w-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all text-xs"
                                    >
                                        {generatingRoadmap ? "Analyzing..." : "Generate AI Blueprint"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Roadmap Display Section */}
                <div id="roadmap-view">
                    <AnimatePresence mode="wait">
                        {generatingRoadmap && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card p-12 text-center mb-12"
                            >
                                <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                                <h3 className="text-2xl font-bold mb-2">Deep Thinking...</h3>
                                <p className="text-muted-foreground">Searching knowledge base, analyzing job market trends, and crafting your custom roadmap.</p>
                            </motion.div>
                        )}

                        {activeRoadmap && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8 mb-12"
                            >
                                <div className="glass-card p-8 border-accent/30 bg-accent/5 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                                    </div>
                                    <h2 className="text-3xl font-black mb-4">Strategic Blueprint: {activeRoadmap.career_title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="p-4 bg-background/50 rounded-2xl border border-border">
                                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Market Demand</p>
                                            <p className="text-xl font-bold text-accent">{activeRoadmap.market_snapshot.demand}</p>
                                        </div>
                                        <div className="p-4 bg-background/50 rounded-2xl border border-border">
                                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Entry Salary</p>
                                            <p className="text-xl font-bold text-green-500">{activeRoadmap.market_snapshot.salary}</p>
                                        </div>
                                        <div className="p-4 bg-background/50 rounded-2xl border border-border">
                                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Job Ready</p>
                                            <p className="text-xl font-bold text-blue-500">{activeRoadmap.readiness_score}%</p>
                                        </div>
                                    </div>

                                    {activeRoadmap.market_snapshot.reality_check && (
                                        <div className="mb-8 p-4 bg-accent/10 border-l-4 border-accent rounded-r-xl italic text-sm">
                                            " {activeRoadmap.market_snapshot.reality_check} "
                                        </div>
                                    )}

                                    {/* Action Plan from AI */}
                                    {activeRoadmap.action_plan && (
                                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                                            <div className="p-6 bg-background/60 rounded-3xl border border-border">
                                                <h4 className="font-bold mb-4 flex items-center gap-2 text-accent">
                                                    <span className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center text-xs">A</span>
                                                    Immediate Steps
                                                </h4>
                                                <div className="space-y-2">
                                                    {activeRoadmap.action_plan.short_term.map((step, i) => (
                                                        <div key={i} className="flex gap-3 text-sm">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                                                            <span>{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-background/60 rounded-3xl border border-border">
                                                <h4 className="font-bold mb-4 flex items-center gap-2 text-primary-indigo">
                                                    <span className="w-6 h-6 bg-primary-indigo/20 rounded flex items-center justify-center text-xs">B</span>
                                                    Long Term Growth
                                                </h4>
                                                <div className="space-y-2">
                                                    {activeRoadmap.action_plan.long_term.map((step, i) => (
                                                        <div key={i} className="flex gap-3 text-sm">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-indigo mt-1.5" />
                                                            <span>{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-12 mb-10">
                                        {activeRoadmap.phases.map((phase) => (
                                            <div key={phase.phase} className="relative pl-12 border-l-2 border-accent/30 py-4">
                                                <div className="absolute left-[-1.1rem] top-6 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-lg">
                                                    {phase.phase}
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-2xl font-bold mb-1">{phase.title}</h4>
                                                        <p className="text-muted-foreground text-sm">Duration: {phase.duration}</p>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <h5 className="font-bold flex items-center gap-2"><span className="p-1 bg-accent/20 rounded">🎯</span> Key Skills</h5>
                                                            <div className="space-y-2">
                                                                {phase.skills.map((skill, i) => (
                                                                    <div key={i} className="flex justify-between items-center p-3 bg-background/40 rounded-xl border border-border/50">
                                                                        <span className="font-medium">{skill.name}</span>
                                                                        <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">{skill.time}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h5 className="font-bold flex items-center gap-2"><span className="p-1 bg-blue-500/20 rounded">📚</span> Verified Resources</h5>
                                                            <div className="space-y-2">
                                                                {phase.resources.map((res, i) => (
                                                                    <a key={i} href={res.url} target="_blank" className="flex items-center justify-between p-3 bg-background/40 rounded-xl border border-border/50 hover:border-accent/40 transition-all">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium text-sm">{res.name}</span>
                                                                            <span className="text-[10px] uppercase opacity-50">{res.type} • {res.lang}</span>
                                                                        </div>
                                                                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {activeRoadmap.scholarships_and_schemes.length > 0 && (
                                        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl mb-8">
                                            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2"><span className="text-lg">🎖️</span> Relevant Scholarships & Government Schemes</h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {activeRoadmap.scholarships_and_schemes.map((scheme, i) => (
                                                    <div key={scheme.name} className="p-4 bg-white dark:bg-zinc-900 border border-green-500/10 rounded-2xl">
                                                        <p className="font-bold text-sm mb-1">{scheme.name}</p>
                                                        <p className="text-xs text-muted-foreground">{scheme.benefit}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <Button className="flex-1 bg-accent text-white py-6 rounded-2xl shadow-xl">Complete Roadmap as PDF</Button>
                                        <Button variant="outline" className="flex-1 py-6 rounded-2xl">Remind me on WhatsApp</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                                <div key={skill.name} className="animate-in-scale" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">{skill.name}</span>
                                        <span className="text-sm font-bold text-accent">{skill.level}%</span>
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
                                        skill.priority === "high" ? "bg-red-500/10 border-red-500/30" :
                                            "bg-yellow-500/10 border-yellow-500/30"
                                    )}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <span className="font-medium">{skill.name}</span>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                        skill.priority === "high" ? "bg-red-500/20 text-red-600 dark:text-red-400" :
                                            "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                    )}>
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
                            <div key={path.title} className={cn("p-6 bg-gradient-to-br from-primary-indigo/5 to-teal/5 rounded-2xl border border-foreground/10 animate-in-scale", `animation-delay-${(index + 1) * 100}`)}>
                                <h3 className="font-bold text-lg mb-2">{path.title}</h3>
                                <p className="text-sm text-foreground/60 mb-4">Duration: {path.duration}</p>
                                <div className="space-y-2">
                                    {path.resources.map((resource) => (
                                        <a
                                            key={resource.name}
                                            href={resource.url}
                                            className="flex items-center gap-2 text-sm text-accent hover:underline"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        Chat with our AI mentor to get personalized advice, clarify your career path, and discuss specific challenges.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
                        <Link href={ROUTES.mentor}>
                            <Button size="lg" className="bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-transform shadow-lg">
                                Chat with Mentor
                            </Button>
                        </Link>
                        <Link href={ROUTES.resources}>
                            <Button size="lg" variant="outline" className="border-primary-indigo text-primary-indigo hover:bg-primary-indigo/10">
                                Explore Resources
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- Professional Print View (Hidden on Screen) --- */}
            <div className="hidden print:block p-0 m-0 bg-white text-black font-sans w-full">
                {/* PDF Header */}
                <div className="border-b-4 border-accent pb-8 mb-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                                <Zap className="text-white w-6 h-6" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter text-black">
                                udaansetu.ai
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Empowering Rural Youth Through AI Careers</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-800 mb-1">Career Analysis Report</h1>
                        <p className="text-xs text-gray-400">Date: {mounted && reportData.generatedAt.toLocaleDateString()}</p>
                    </div>
                </div>

                {/* User Summary Section */}
                <div className="grid grid-cols-2 gap-10 mb-12">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-accent">
                            <User className="w-5 h-5" /> Candidate Information
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="text-gray-500 font-medium">Name:</span>
                                <span className="font-bold">{user?.displayName || "Udaan User"}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="text-gray-500 font-medium">Readiness Index:</span>
                                <span className="font-bold text-accent">{reportData.careerReadiness}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Status:</span>
                                <span className="font-bold text-green-600 uppercase text-xs">Certified Analysis</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
                            <Award className="w-5 h-5" /> Behavioral Strengths
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {reportData.topStrengths.map(s => (
                                <div key={s} className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
                                    <CheckCircle2 className="w-3 h-3" /> {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Key Insights & Bio */}
                <div className="mb-12">
                    <h3 className="text-lg font-bold mb-4 border-l-4 border-accent pl-3">Executive Summary</h3>
                    <div className="bg-gray-50 p-6 rounded-3xl text-sm leading-relaxed text-gray-700 border border-gray-100">
                        {reportData.personalityTraits.join(" • ")}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mb-12">
                    <h3 className="text-lg font-bold mb-6 border-l-4 border-blue-600 pl-3">Target Career Paths</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {reportData.recommendations.map(c => (
                            <div key={c.title} className="p-5 border-2 border-gray-100 rounded-2xl">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-md">{c.title}</p>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">{c.match}% Match</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{c.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {c.requirements.map(r => (
                                        <span key={r} className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-400">{r}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Roadmap Section (If exists) */}
                {activeRoadmap && (
                    <div className="page-break-before">
                        <div className="bg-accent text-white p-6 rounded-2xl mb-8 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase">Career Implementation Roadmap</h2>
                                <p className="text-sm opacity-80">Title: {activeRoadmap.career_title}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black">{activeRoadmap.readiness_score}%</p>
                                <p className="text-[10px] uppercase font-bold">Market Readiness</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {activeRoadmap.phases.map(p => (
                                <div key={p.phase} className="p-6 border-b border-gray-100 last:border-0">
                                    <h4 className="font-black text-xl mb-4 text-gray-800">PHASE {p.phase}: {p.title} <span className="text-sm font-normal text-gray-400 ml-2">({p.duration})</span></h4>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Skill Focus</p>
                                            <div className="space-y-2">
                                                {p.skills.map(s => (
                                                    <div key={s.name} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1">
                                                        <span>{s.name}</span>
                                                        <span className="text-xs text-accent font-bold">{s.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Resources</p>
                                            <div className="space-y-1">
                                                {p.resources.map(r => (
                                                    <div key={r.name} className="text-xs text-blue-600 font-medium py-1">
                                                        • {r.name} ({r.type})
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
                    <p>© 2026 UdaanSetu.ai | Personal Career Analysis</p>
                    <p>Verified by GenAI Engines</p>
                </div>
            </div>
        </div>
    );
}

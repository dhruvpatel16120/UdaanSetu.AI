"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/store/theme/ThemeProvider";
import { ENV } from "@/constants/env";
import { ROUTES } from "@/constants/routes";
import { motion } from "framer-motion";
import {
    User, Mail, Calendar, MapPin,
    BookOpen, Briefcase, Target,
    Edit, Save, Loader2, Award, Zap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function ProfilePage() {
    const { user, status } = useAuth();
    const { theme } = useTheme();

    // State
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [assessment, setAssessment] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch Data
    useEffect(() => {
        if (status === "loading") return;
        if (!user) return; // Wait for redirect or handled by layout

        async function fetchData() {
            try {
                // Parallel Fetch: User Profile + Assessment Result
                const [profRes, assessRes] = await Promise.all([
                    fetch(`${ENV.apiUrl}/api/user/${user?.uid}`), // Assuming this endpoint exists or similar
                    fetch(`${ENV.apiUrl}/api/assessment/result/${user?.uid}`)
                ]);

                if (profRes.ok) {
                    const profData = await profRes.json();
                    setProfile(profData);
                }

                if (assessRes.ok) {
                    const assessData = await assessRes.json();
                    setAssessment(assessData);
                }

            } catch (err: any) {
                console.error("Failed to load profile data", err);
                setError("Could not load full profile.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, status]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <Link href={ROUTES.auth.signIn}>
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Derived Data
    const bioData = assessment?.generated_bio || {};
    const aiReport = bioData.ai_report || {};
    const traits = bioData.traits || {};
    const scores = bioData.scores || {};

    return (
        <div className={cn(
            "min-h-screen py-12 px-4 transition-colors duration-500",
            theme === "dark" ? "bg-[#020617]" : "bg-zinc-50"
        )}>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-10 relative overflow-hidden bg-white dark:bg-zinc-900 border-border"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-accent to-orange-500 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    {bioData.static_name || user.displayName || "Young Achiever"}
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {profile?.educationLevel && (
                                    <div className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium flex items-center gap-2 border border-blue-500/20">
                                        <BookOpen className="w-4 h-4" /> {profile.educationLevel}
                                    </div>
                                )}
                                {bioData.static_district && (
                                    <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium flex items-center gap-2 border border-green-500/20 capitalize">
                                        <MapPin className="w-4 h-4" /> {bioData.static_district}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link href={ROUTES.profileEdit}>
                            <Button variant="outline" className="gap-2">
                                <Edit className="w-4 h-4" /> Edit Profile
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Left Col: Bio & Stats */}
                    <div className="space-y-8 md:col-span-2">

                        {/* AI Bio Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-8 bg-card border-border"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-accent" /> Professional Bio
                            </h2>
                            {aiReport ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed text-foreground/80">
                                        {/* Fallback bio generation if AI report is minimal */}
                                        {aiReport.bio || `Based on your assessment, you show strong potential in ${aiReport.recommendations?.[0]?.title || "diverse fields"}. Your profile indicates a natural aptitude for ${Object.keys(scores).map(s => s.replace('_', ' ')).slice(0, 2).join(" & ")}. Keep pushing forward!`}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-muted/30 rounded-xl">
                                    <p className="text-muted-foreground mb-4">No bio generated yet.</p>
                                    <Link href={ROUTES.assessment}>
                                        <Button>Take Assessment</Button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                        {/* Top Strengths */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-8 bg-card border-border"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> Top Strengths
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {aiReport.topStrengths?.map((strength: string, i: number) => (
                                    <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                        <span className="font-medium text-foreground">{strength}</span>
                                    </div>
                                )) || <p className="text-muted-foreground">Strengths will appear here after assessment.</p>}
                            </div>
                        </motion.div>

                    </div>

                    {/* Right Col: Assessment Scores */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 bg-card border-border sticky top-24"
                        >
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-500" /> Skill Profile
                            </h2>

                            {Object.entries(scores).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(scores).map(([key, val]: any) => (
                                        <div key={key}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium capitalize text-muted-foreground">
                                                    {key.replace(/_/g, " ")}
                                                </span>
                                                <span className="text-sm font-bold">{val}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${val}%` }}
                                                    transition={{ duration: 1 }}
                                                    className="h-full bg-accent rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground mb-4">Complete assessment to see scores</p>
                                    <Link href={ROUTES.assessment}>
                                        <Button variant="outline" size="sm">Start Now</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-border">
                                <h3 className="text-sm font-semibold mb-2">Recommended Path</h3>
                                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <p className="font-bold text-green-600 dark:text-green-400">
                                        {aiReport.recommendations?.[0]?.title || "General Exploratory"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}

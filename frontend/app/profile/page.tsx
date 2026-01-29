"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/store/theme/ThemeProvider";
import { useRouter } from "next/navigation";
import { ENV } from "@/constants/env";
import { ROUTES } from "@/constants/routes";
import { motion } from "framer-motion";
import {
    User, Mail, MapPin,
    BookOpen, Target,
    Edit, Loader2, Award, Zap, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function ProfilePage() {
    const { user, status } = useAuth();
    const { t } = useI18n();
    const { theme } = useTheme();
    const router = useRouter();

    // State
    const [loading, setLoading] = useState(true);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [profile, setProfile] = useState<any>(null);
    const [assessment, setAssessment] = useState<any>(null);

    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

    const countdownTimer = useRef<NodeJS.Timeout | null>(null);

    // Fetch Data
    useEffect(() => {
        if (status === "loading") return;
        if (!user) return;

        async function fetchData() {
            try {
                // Parallel Fetch: User Profile + Assessment Result
                const [profRes, assessRes] = await Promise.all([
                    fetch(`${ENV.apiUrl}/api/user/${user?.uid}`),
                    fetch(`${ENV.apiUrl}/api/assessment/result/${user?.uid}`)
                ]);

                if (profRes.ok) {
                    const profData = await profRes.json();
                    setProfile(profData);
                }

                if (assessRes.ok) {
                    const assessData = await assessRes.json();
                    setAssessment(assessData);

                    // If no assessment data found, trigger redirect logic
                    if (!assessData || Object.keys(assessData).length === 0) {
                        setRedirectCountdown(7);
                    }
                } else if (assessRes.status === 404) {
                    // Assessment explicitly not found
                    setRedirectCountdown(7);
                }

            } catch (err: unknown) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, status]);

    // Handle Countdown
    useEffect(() => {
        if (redirectCountdown === null) return;

        if (redirectCountdown > 0) {
            countdownTimer.current = setTimeout(() => {
                setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
            }, 1000);
        } else {
            router.push(ROUTES.assessment || "/assessment");
        }

        return () => {
            if (countdownTimer.current) clearTimeout(countdownTimer.current);
        };
    }, [redirectCountdown, router]);

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
                    <h1 className="text-2xl font-bold mb-4">{t("auth.action.signIn")}</h1>
                    <Link href={ROUTES.auth.signIn}>
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Redirect UI
    if (redirectCountdown !== null) {
        return (
            <div className={cn(
                "min-h-screen flex items-center justify-center p-6 transition-colors duration-500",
                theme === "dark" ? "bg-[#020617]" : "bg-zinc-50"
            )}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-md w-full p-8 text-center space-y-6 bg-white dark:bg-zinc-900 border-border shadow-2xl"
                >
                    <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-10 h-10 text-orange-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">{t("assessment.required")}</h2>
                        <p className="text-muted-foreground">
                            {t("assessment.requiredDesc") || "To view your profile and personalized guidance, you must first complete the UdaanSetu assessment test."}
                        </p>
                    </div>

                    <div className="py-4">
                        <div className="text-4xl font-extrabold text-accent">
                            {redirectCountdown}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{t("common.redirecting")}</p>
                    </div>

                    <Link href={ROUTES.assessment || "/assessment"}>
                        <Button className="w-full bg-accent text-white py-6 text-lg font-bold shadow-lg shadow-accent/20">
                            {t("nav.startAssessment")}
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Derived Data - Favor Profile (synced) over Assessment (raw)
    const traits = profile?.traits || assessment?.generated_bio?.trait_scores || {};
    const aiReport = profile?.ai_report || {};
    const profileBio = profile?.bio || aiReport.bio || assessment?.generated_bio?.bio_text;
    const displayName = assessment?.analysis?.basic_info?.name || profile?.basic_info?.name || profile?.name || assessment?.generated_bio?.basic_info?.name || user.displayName || "Result Seeker";
    const location = assessment?.analysis?.basic_info?.location || profile?.basic_info?.location || profile?.location || assessment?.generated_bio?.basic_info?.location;
    const education = assessment?.analysis?.basic_info?.education || profile?.basic_info?.education || profile?.educationLevel || profile?.education || assessment?.generated_bio?.basic_info?.education;

    const scores = traits;

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
                                    <Image src={user.photoURL} alt="Profile" className="object-cover" fill />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    {displayName}
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {education && (
                                    <div className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium flex items-center gap-2 border border-blue-500/20">
                                        <BookOpen className="w-4 h-4" /> {education}
                                    </div>
                                )}
                                {location && (
                                    <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium flex items-center gap-2 border border-green-500/20 capitalize">
                                        <MapPin className="w-4 h-4" /> {location}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link href={ROUTES.profileEdit}>
                            <Button variant="outline" className="gap-2">
                                <Edit className="w-4 h-4" /> {t("profile.edit")}
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
                                <Award className="w-5 h-5 text-accent" /> {t("profile.bio")}
                            </h2>
                            {profileBio ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed text-foreground/80">
                                        {profileBio}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-muted/30 rounded-xl">
                                    <p className="text-muted-foreground mb-4">{t("profile.noBio")}</p>
                                    <Link href={ROUTES.assessment}>
                                        <Button>{t("nav.startAssessment")}</Button>
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
                                <Zap className="w-5 h-5 text-yellow-500" /> {t("profile.topStrengths")}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {aiReport.topStrengths?.map((strength: string, i: number) => (
                                    <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                        <span className="font-medium text-foreground">{strength}</span>
                                    </div>
                                )) || <p className="text-muted-foreground">{t("profile.noStrengths")}</p>}
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
                                <Target className="w-5 h-5 text-blue-500" /> {t("profile.skillProfile")}
                            </h2>

                            {Object.entries(scores).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(scores as Record<string, number>).map(([key, val]) => (
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
                                    <p className="text-sm text-muted-foreground mb-4">{t("profile.completeAssessment")}</p>
                                    <Link href={ROUTES.assessment}>
                                        <Button variant="outline" size="sm">{t("common.startNow")}</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-border">
                                <h3 className="text-sm font-semibold mb-2">{t("profile.recommendedPath")}</h3>
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

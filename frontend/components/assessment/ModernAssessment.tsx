"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    MapPin,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Brain,
    Target,
    Rocket,
    CheckCircle2,
    AlertCircle,
    Loader2,
    BookOpen,
    Award,
    Users,
    Banknote,
    Heart,
    Palette,
    Coins,
    Frown,
    Truck,
    Languages
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/store/theme/ThemeProvider";
import { ENV } from "@/constants/env";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// --- Types ---
interface BackendOption {
    id: string;
    text: { en: string; gu: string };
    traits?: Record<string, any>;
}

interface BackendQuestion {
    id: string;
    section: string;
    type: string;
    icon?: string;
    text: { en: string; gu: string };
    options?: BackendOption[];
    next_question_id?: string;
}

// --- Icons Mapping ---
const iconMap: Record<string, any> = {
    user: User,
    map_pin: MapPin,
    calendar: Calendar,
    book_open: BookOpen,
    award: Award,
    users: Users,
    banknote: Banknote,
    heart: Heart,
    palette: Palette,
    brain: Brain,
    target: Target,
    coins: Coins,
    sparkles: Sparkles,
    frown: Frown,
    truck: Truck,
    education: BookOpen,
    familybackground: Users,
    familyincome: Banknote,
    interest: Target,
    hobbies: Palette,
    psychology: Brain,
    vision: Rocket,
    expectations: Coins,
    selfreflection: User,
    mobility: Truck
};

// --- Sub-Components ---
const ScreenWrapper = ({ children, className }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("w-full max-w-3xl mx-auto px-4", className)}
    >
        {children}
    </motion.div>
);

export function ModernAssessment() {
    const { language, t } = useI18n();
    const { user } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    // --- State ---
    const [step, setStep] = useState<"landing" | "info" | "assessment" | "loading" | "complete" | "error">("landing");
    const [questions, setQuestions] = useState<BackendQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [basicInfo, setBasicInfo] = useState({
        name: "",
        gender: "",
        dateOfBirth: "",
        location: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [aiStatus, setAiStatus] = useState(t("assessment.analyzingPath"));
    const [maxQuestions, setMaxQuestions] = useState(3);

    // --- Effects ---
    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (step === "assessment" && questions.length === 0) {
            fetchFirstQuestion();
        }
    }, [step]);

    // --- Handlers ---
    const fetchConfig = async () => {
        try {
            const res = await fetch(`${ENV.apiUrl}/api/assessment/config`);
            if (res.ok) {
                const data = await res.json();
                setMaxQuestions(data.max_questions || 3);
            }
        } catch (e) {
            console.error("Failed to fetch config", e);
        }
    };

    const fetchFirstQuestion = async () => {
        setIsLoading(true);
        try {
            // Updated to use 'start' for random first question
            const res = await fetch(`${ENV.apiUrl}/api/assessment/question/start`);
            if (!res.ok) throw new Error(t("assessment.errorStart"));
            const firstQ = await res.json();
            setQuestions([firstQ]);
        } catch (err) {
            setStep("error");
            setErrorMessage(t("assessment.errorConnect"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!basicInfo.name || !basicInfo.location || !basicInfo.gender || !basicInfo.dateOfBirth) {
            return;
        }
        setStep("assessment");
    };

    const handleAnswerSelect = (optionId: string) => {
        setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: optionId }));
    };

    const handleNext = async () => {
        const currentQ = questions[currentIndex];
        const currentAnswer = answers[currentQ.id];

        if (!currentAnswer) return;

        // If we've already fetched more questions and are just navigating history
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }

        setIsLoading(true);
        setAiStatus(getRandomStatus());
        try {
            // Send full history for AI-powered next question
            const history = questions.map(q => ({
                question_id: q.id,
                selected_option_id: answers[q.id],
                text_answer: q.type === "text" ? answers[q.id] : undefined
            }));

            const res = await fetch(`${ENV.apiUrl}/api/assessment/next-question`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: history })
            });

            if (!res.ok) throw new Error(t("assessment.errorConnectionLost"));
            const nextQ = await res.json();

            if (nextQ && questions.length < maxQuestions) {
                setQuestions(prev => [...prev, nextQ]);
                setCurrentIndex(prev => prev + 1);
            } else {
                await submitFinalAssessment();
            }
        } catch (err) {
            setErrorMessage(t("assessment.errorTimeout"));
        } finally {
            setIsLoading(false);
        }
    };

    const submitFinalAssessment = async () => {
        setStep("loading");
        setAiStatus(t("assessment.craftingRoadmap"));
        try {
            const payload = [
                ...Object.entries(answers).map(([qId, val]) => {
                    const q = questions.find(question => question.id === qId);
                    const isText = q?.type === "text";
                    return {
                        question_id: qId,
                        selected_option_id: isText ? undefined : val,
                        text_answer: isText ? val : undefined
                    };
                }),
                { question_id: 'static_name', text_answer: basicInfo.name },
                { question_id: 'static_gender', selected_option_id: basicInfo.gender.toLowerCase() },
                { question_id: 'static_dob', text_answer: basicInfo.dateOfBirth },
                { question_id: 'static_district', selected_option_id: basicInfo.location.toLowerCase() }
            ];

            const res = await fetch(`${ENV.apiUrl}/api/assessment/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Firebase-Id": user?.uid || ""
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(t("assessment.errorSubmit"));

            setStep("complete");
            setTimeout(() => {
                router.push(ROUTES.assessmentResult);
            }, 2500);
        } catch (err) {
            setStep("error");
            setErrorMessage(t("assessment.errorGenerateReport"));
        }
    };

    const getRandomStatus = () => {
        const statuses = [
            t("assessment.statusAnalyzing"),
            t("assessment.statusMapping"),
            t("assessment.statusSearching"),
            t("assessment.statusContextualizing"),
            t("assessment.statusGenerating")
        ];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const getText = (textObj: { en: string; gu: string } | undefined) => {
        if (!textObj) return "";
        return language === "gu" ? textObj.gu : textObj.en;
    };

    const progress = (currentIndex + 1) / maxQuestions * 100;

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12">
            <AnimatePresence mode="wait">

                {/* Step: Loading Assessment Questions */}
                {step === "assessment" && questions.length === 0 && (
                    <ScreenWrapper key="fetching" className="text-center py-20">
                        <div className="relative inline-block mb-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 border-4 border-accent/20 border-t-accent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-accent animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-foreground">{t("assessment.loading")}</h2>
                        <p className="text-xl text-muted-foreground animate-pulse">{t("assessment.analyzingPath")}</p>
                    </ScreenWrapper>
                )}

                {/* Step: Landing */}
                {step === "landing" && (
                    <ScreenWrapper key="landing" className="text-center">
                        <div className="relative inline-block mb-10">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"
                            />
                            <div className="relative glass-card p-6 rounded-3xl bg-card border-border shadow-2xl overflow-hidden group">
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Image
                                        src="/logo.png"
                                        alt="UdaanSetu.AI Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter lowercase">
                            <span className={cn(
                                "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                                theme === "light"
                                    ? "from-yellow-600 via-yellow-500 to-amber-500"
                                    : "from-yellow-400 via-yellow-300 to-amber-300"
                            )}>
                                udaan
                            </span>
                            <span className={cn(
                                "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                                theme === "light"
                                    ? "from-amber-500 via-orange-500 to-orange-600"
                                    : "from-amber-300 via-orange-300 to-orange-400"
                            )}>
                                setu.ai
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-foreground font-medium opacity-80 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t("assessment.discoveryTitle")}
                        </p>
                        <Button
                            onClick={() => setStep("info")}
                            size="lg"
                            className="px-10 py-8 text-xl font-bold rounded-full bg-accent hover:bg-accent/90 shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 text-white"
                        >
                            {t("assessment.startDiscovery")} <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                    </ScreenWrapper>
                )}

                {/* Step: Basic Info */}
                {step === "info" && (
                    <ScreenWrapper key="info">
                        <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-card border-border shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <User className="w-32 h-32" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-foreground">{t("assessment.basicProfile")}</h2>
                            <p className="text-muted-foreground mb-10">{t("assessment.basicProfileDesc")}</p>

                            <form onSubmit={handleInfoSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground opacity-80 flex items-center gap-2">
                                            <User className="w-4 h-4 text-accent" /> {t("assessment.fullName")}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={basicInfo.name}
                                            onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                            className="w-full bg-muted/50 border border-border rounded-2xl p-4 outline-none focus:border-accent focus:bg-background transition-all text-lg text-foreground placeholder:opacity-50"
                                            placeholder={t("assessment.namePlaceholder")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground opacity-80 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-accent" /> {t("assessment.birthDate")}
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            value={basicInfo.dateOfBirth}
                                            onChange={e => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })}
                                            className="w-full bg-muted/50 border border-border rounded-2xl p-4 outline-none focus:border-accent focus:bg-background transition-all text-lg text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground opacity-80 flex items-center gap-2">
                                            <Languages className="w-4 h-4 text-accent" /> {t("assessment.genderLabel")}
                                        </label>
                                        <div className="flex gap-4">
                                            {["Male", "Female", "Other"].map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setBasicInfo({ ...basicInfo, gender: g })}
                                                    className={cn(
                                                        "flex-1 p-4 rounded-2xl border transition-all text-center font-medium",
                                                        basicInfo.gender === g
                                                            ? "bg-accent border-accent text-white shadow-lg"
                                                            : "bg-muted/50 border-border hover:bg-muted text-foreground"
                                                    )}
                                                >
                                                    {g === "Male" ? t("assessment.male") : g === "Female" ? t("assessment.female") : t("assessment.other")}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-semibold text-foreground opacity-80 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-accent" /> {t("assessment.location")}
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={basicInfo.location}
                                                onChange={e => setBasicInfo({ ...basicInfo, location: e.target.value })}
                                                className="w-full bg-muted/50 border border-border rounded-2xl p-4 outline-none focus:border-accent focus:bg-background transition-all text-lg text-foreground appearance-none shadow-sm cursor-pointer"
                                            >
                                                <option value="" className="bg-background text-foreground">{t("assessment.selectDistrict")}</option>
                                                <option value="Ahmedabad" className="bg-background text-foreground">{t("assessment.district.ahmedabad")}</option>
                                                <option value="Surat" className="bg-background text-foreground">{t("assessment.district.surat")}</option>
                                                <option value="Vadodara" className="bg-background text-foreground">{t("assessment.district.vadodara")}</option>
                                                <option value="Rajkot" className="bg-background text-foreground">{t("assessment.district.rajkot")}</option>
                                                <option value="Other" className="bg-background text-foreground">{t("assessment.district.other")}</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <ArrowRight className="w-5 h-5 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-between items-center">
                                    <button type="button" onClick={() => setStep("landing")} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-medium">
                                        <ArrowLeft className="w-4 h-4" /> {t("assessment.back")}
                                    </button>
                                    <Button type="submit" size="lg" className="rounded-full px-8 bg-accent hover:bg-accent/90 shadow-xl text-white">
                                        {t("assessment.continue")} <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </ScreenWrapper>
                )}

                {/* Step: Assessment */}
                {step === "assessment" && questions.length > 0 && (
                    <ScreenWrapper key="assessment" className="max-w-5xl">
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Brain className="w-5 h-5 text-accent" />
                                    </div>
                                    <span className="font-bold text-lg tracking-tight uppercase text-foreground opacity-60">
                                        {t("assessment.stepCounter", { current: currentIndex + 1, total: maxQuestions })}
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-accent">{Math.round(progress)}%</div>
                            </div>
                            <div className="w-full bg-muted border border-border rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-accent to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-[1fr_2fr] gap-10 items-start">
                            {/* Category Info */}
                            <div className="hidden md:block sticky top-12">
                                <div className="glass-card p-8 bg-accent/5 border-accent/20 rounded-3xl">
                                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/40">
                                        {currentIndex < questions.length && (
                                            (() => {
                                                const sectionKey = questions[currentIndex].section.toLowerCase().replace(/\s+/g, '');
                                                const Icon = iconMap[sectionKey] || Brain;
                                                return <Icon className="w-8 h-8 text-white" />
                                            })()
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 uppercase tracking-widest text-accent">
                                        {t(`assessment.${questions[currentIndex].section.toLowerCase().replace(/\s+/g, '')}` as any) || questions[currentIndex].section}
                                    </h3>
                                    <p className="text-foreground opacity-80 leading-relaxed italic font-medium">
                                        {t("assessment.sectionDesc")}
                                    </p>
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="glass-card p-6 md:p-8 bg-card border-border rounded-[2rem] shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Target className="w-24 h-24 text-foreground" />
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight text-foreground relative z-10">
                                    {getText(questions[currentIndex].text)}
                                </h2>

                                <div className="space-y-3 relative z-10">
                                    {questions[currentIndex].type === "text" ? (
                                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                            <textarea
                                                rows={3}
                                                value={answers[questions[currentIndex].id] || ""}
                                                onChange={e => handleAnswerSelect(e.target.value)}
                                                className="w-full bg-muted/50 border border-border rounded-xl p-4 outline-none focus:border-accent focus:bg-background transition-all text-lg text-foreground placeholder:text-muted-foreground/50 hover:bg-muted"
                                                placeholder={t("assessment.placeholderPerspective")}
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {questions[currentIndex].options?.map((opt, i) => (
                                                <motion.button
                                                    key={opt.id}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => handleAnswerSelect(opt.id)}
                                                    className={cn(
                                                        "w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all relative group overflow-hidden",
                                                        answers[questions[currentIndex].id] === opt.id
                                                            ? "bg-accent/10 border-accent shadow-[0_4px_20px_rgba(249,115,22,0.1)]"
                                                            : "bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all px-0",
                                                            answers[questions[currentIndex].id] === opt.id
                                                                ? "bg-accent border-accent scale-110 shadow-lg"
                                                                : "border-border bg-background"
                                                        )}>
                                                            {answers[questions[currentIndex].id] === opt.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                        </div>
                                                        <span className={cn(
                                                            "text-lg font-semibold transition-colors",
                                                            answers[questions[currentIndex].id] === opt.id ? "text-accent" : "text-foreground"
                                                        )}>{getText(opt.text)}</span>
                                                    </div>

                                                    <div className={cn(
                                                        "absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent transition-transform duration-500 origin-left",
                                                        answers[questions[currentIndex].id] === opt.id ? "scale-x-100" : "scale-x-0"
                                                    )} />
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex justify-between items-center relative z-10">
                                    <button
                                        onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                                        disabled={currentIndex === 0}
                                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 flex items-center gap-2 font-medium text-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> {t("assessment.previous")}
                                    </button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!answers[questions[currentIndex].id] || isLoading}
                                        className="rounded-full px-8 py-6 text-base bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 text-white"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> {t("assessment.processing")}
                                            </span>
                                        ) : (
                                            currentIndex === maxQuestions - 1 || (questions.length === maxQuestions && currentIndex === questions.length - 1)
                                                ? t("assessment.finishJourney")
                                                : <span className="flex items-center gap-2">{t("assessment.next")} <ArrowRight className="w-4 h-4" /></span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScreenWrapper>
                )}

                {/* Step: Loading / Processing */}
                {step === "loading" && (
                    <ScreenWrapper key="loading" className="text-center py-20">
                        <div className="relative inline-block mb-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 border-4 border-accent/20 border-t-accent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain className="w-12 h-12 text-accent animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-foreground">{t("assessment.thinking")}</h2>
                        <p className="text-xl text-muted-foreground max-w-md mx-auto animate-pulse">{aiStatus}</p>
                    </ScreenWrapper>
                )}

                {/* Step: Complete */}
                {step === "complete" && (
                    <ScreenWrapper key="complete" className="text-center">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/10">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <h2 className="text-5xl font-black mb-4 text-foreground">{t("assessment.journeyComplete")}</h2>
                        <p className="text-2xl text-muted-foreground mb-10">{t("assessment.blueprintReady")}</p>
                        <div className="flex items-center justify-center gap-3 text-accent font-bold text-xl">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            {t("assessment.redirectingDashboard")}
                        </div>
                    </ScreenWrapper>
                )}

                {/* Step: Error */}
                {step === "error" && (
                    <ScreenWrapper key="error" className="text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-foreground">{t("assessment.missionHalted")}</h2>
                        <p className="text-lg text-muted-foreground mb-8">{errorMessage || "The engine hit a roadblock."}</p>
                        <Button onClick={() => window.location.reload()} className="rounded-full bg-accent text-white px-10 py-6">
                            {t("assessment.retryQuest")}
                        </Button>
                    </ScreenWrapper>
                )}

            </AnimatePresence>

            {/* Background Decorative Blur */}
            <div className="fixed top-0 left-0 w-full h-full -z-50 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
            </div>
        </div>
    );
}

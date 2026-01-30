"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/store/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Lightbulb, TrendingUp, Users, Globe, Lock, ChevronRight, ClipboardCheck, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ENV } from "@/constants/env";
import { useRouter } from "next/navigation";
import remarkGfm from "remark-gfm";
import { TranslationKey } from "@/types/i18n";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const quickActions = [
    { icon: Lightbulb, key: "mentor.qa.skills" as TranslationKey },
    { icon: TrendingUp, key: "mentor.qa.career" as TranslationKey },
    { icon: Users, key: "mentor.qa.start" as TranslationKey },
    { icon: Globe, key: "mentor.qa.whatIs" as TranslationKey },
];

export default function MentorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { language, setLanguage, t } = useI18n();
    const { theme } = useTheme();
    const [showLanguagePopup, setShowLanguagePopup] = useState(false);
    const [hasShownInitialPopup, setHasShownInitialPopup] = useState(false);
    const [prereqStatus, setPrereqStatus] = useState<{
        hasAssessment: boolean;
        hasCareerReport: boolean;
        loading: boolean;
    }>({ hasAssessment: false, hasCareerReport: false, loading: true });
    const router = useRouter();

    // Check prerequisites on mount
    useEffect(() => {
        if (!user) return;

        const checkPrereqs = async () => {
            try {
                const token = await user.getIdToken?.();
                const response = await fetch(`${ENV.apiUrl}/api/assessment/status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setPrereqStatus({
                        hasAssessment: !!data.has_assessment,
                        hasCareerReport: !!data.has_report,
                        loading: false
                    });
                } else {
                    setPrereqStatus(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error("Failed to check prerequisites:", err);
                setPrereqStatus(prev => ({ ...prev, loading: false }));
            }
        };

        checkPrereqs();
    }, [user]);

    // Show popup on initial mount - only if prereqs are met or still loading
    useEffect(() => {
        if (!mounted) return;
        
        // Always show popup on visit to ask for preference
        if (!hasShownInitialPopup && prereqStatus.hasAssessment && prereqStatus.hasCareerReport) {
            setShowLanguagePopup(true);
            setHasShownInitialPopup(true);
        }
        
    }, [mounted, hasShownInitialPopup, prereqStatus]);

    // Update language when user selects
    const handleLanguageSelect = (lang: "en" | "gu") => {
        setLanguage(lang);
        setShowLanguagePopup(false);
    };

    // Initialize welcome message on client side only to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: t("mentor.welcome"),
                timestamp: new Date(),
            },
        ]);
    }, [language, t]);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Real API Call with streaming
        try {
            const userId = user?.uid || "demo_user_123";
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    message: userMessage.content,
                    history: history,
                    language: language
                })
            });

            if (!response.ok) throw new Error("API request failed");
            if (!response.body) throw new Error("No response body");

            // Create placeholder for AI response
            const aiMessageId = (Date.now() + 1).toString();
            const aiMessage: Message = {
                id: aiMessageId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                setMessages((prev) => 
                    prev.map((msg) => 
                        msg.id === aiMessageId 
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    )
                );
            }

        } catch (error) {
            console.error(error);
             const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: t("mentor.errorMsg"),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (text: string) => {
        handleSend(text);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary-indigo/5 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-indigo/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            {/* Enhanced Language Preference Popup */}
            <AnimatePresence>
                {mounted && showLanguagePopup && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 glass-card"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-teal/20 rounded-3xl blur-xl -z-10"></div>
                            
                            <div className="text-center mb-8">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-20 h-20 bg-gradient-to-br from-accent to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                                >
                                    <Globe className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
                                    {t("mentor.chooseLang")}
                                </h2>
                                <p className="text-foreground/70 text-sm">
                                    {t("mentor.whichLang")}
                                </p>
                                <p className="text-foreground/70 text-sm mt-1">
                                    {t("mentor.whichLangGu")}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <Button
                                    onClick={() => handleLanguageSelect('en')}
                                    className="w-full bg-white text-black hover:bg-gray-100 border-2 border-transparent hover:border-accent transition-all duration-300 py-6 text-lg shadow-lg group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <span className="text-2xl">🇬🇧</span> English
                                    </span>
                                </Button>
                                
                                <Button
                                    onClick={() => handleLanguageSelect('gu')}
                                    className="w-full bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-all duration-300 py-6 text-lg shadow-lg group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <span className="text-2xl">🇮🇳</span> ગુજરાતી
                                    </span>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prerequisite Restriction Modal */}
            <AnimatePresence>
                {mounted && !prereqStatus.loading && (!prereqStatus.hasAssessment || !prereqStatus.hasCareerReport) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-background border border-foreground/10 rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary-indigo to-teal"></div>
                            
                            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-10 h-10 text-accent" />
                            </div>

                            <h2 className="text-2xl font-bold mb-4">
                                {t("mentor.unlockTitle")}
                            </h2>
                            
                            <p className="text-foreground/70 mb-8 leading-relaxed">
                                {t("mentor.unlockDesc")}
                            </p>

                            <div className="space-y-4">
                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    prereqStatus.hasAssessment ? "bg-teal/5 border-teal/20" : "bg-foreground/5 border-foreground/10 opacity-70"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", prereqStatus.hasAssessment ? "bg-teal/20 text-teal-600" : "bg-foreground/10 text-foreground/40")}>
                                            <ClipboardCheck className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold">{t("mentor.assessment")}</span>
                                    </div>
                                    {prereqStatus.hasAssessment ? (
                                        <span className="text-xs font-bold text-teal-600 bg-teal/10 px-2 py-1 rounded-full">{t("mentor.completed")}</span>
                                    ) : (
                                        <Button size="sm" onClick={() => router.push('/assessment')} className="bg-accent hover:bg-orange-600 text-white text-xs py-1 h-auto">
                                            {t("mentor.startNow")} <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    )}
                                </div>

                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    prereqStatus.hasCareerReport ? "bg-teal/5 border-teal/20" : "bg-foreground/5 border-foreground/10 opacity-70"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", prereqStatus.hasCareerReport ? "bg-teal/20 text-teal-600" : "bg-foreground/10 text-foreground/40")}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold">{t("mentor.report")}</span>
                                    </div>
                                    {prereqStatus.hasCareerReport ? (
                                        <span className="text-xs font-bold text-teal-600 bg-teal/10 px-2 py-1 rounded-full">{t("mentor.generated")}</span>
                                    ) : (
                                        <Button 
                                            size="sm" 
                                            disabled={!prereqStatus.hasAssessment}
                                            onClick={() => router.push('/career-report')} 
                                            className={cn(
                                                "text-white text-xs py-1 h-auto",
                                                prereqStatus.hasAssessment ? "bg-accent hover:bg-orange-600" : "bg-muted cursor-not-allowed"
                                            )}
                                        >
                                            {t("mentor.generate")} <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Button 
                                variant="ghost" 
                                className="mt-8 text-foreground/50 hover:text-foreground"
                                onClick={() => router.push('/dashboard')}
                            >
                                {t("mentor.returnDashboard")}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {message.role === "assistant" ? (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent to-teal rounded-full blur-sm animate-pulse"></div>
                                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent to-teal p-1 shadow-lg">
                                                <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-accent" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo via-purple to-accent rounded-full blur-md opacity-60 animate-pulse"></div>
                                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary-indigo via-purple to-accent p-0.5 shadow-xl">
                                                <div className="w-full h-full bg-gradient-to-br from-primary-indigo to-primary-navy rounded-full flex items-center justify-center text-white font-bold text-sm uppercase tracking-wide shadow-inner">
                                                    {user?.displayName?.[0] || user?.email?.[0] || "U"}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={cn(
                                        "flex-1 max-w-[75%] sm:max-w-[65%] group",
                                        message.role === "user" ? "flex flex-col items-end" : ""
                                    )}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className={cn(
                                            "px-4 py-3 rounded-2xl shadow-lg transition-all duration-200",
                                            message.role === "assistant"
                                                ? "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600"
                                                : "bg-gradient-to-r from-primary-indigo to-primary-navy shadow-xl shadow-primary-indigo/30"
                                        )}
                                        style={message.role === "assistant" ? {
                                            backgroundColor: 'rgb(255, 255, 255)',
                                            color: 'rgb(0, 0, 0)'
                                        } : {
                                            background: 'linear-gradient(to right, rgb(67, 56, 202), rgb(30, 27, 75))',
                                            color: 'rgb(255, 255, 255)'
                                        }}
                                    >
                                        <div 
                                            className={cn(
                                                "text-[16px] leading-relaxed prose prose-sm max-w-none font-bold",
                                                message.role === "assistant" 
                                                    ? "text-black dark:text-white" 
                                                    : "text-white"
                                            )}
                                            style={message.role === "assistant" ? {
                                                color: 'rgb(0, 0, 0)'
                                            } : {
                                                color: 'rgb(255, 255, 255)'
                                            }}
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({children, ...props}) => (
                                                        <p 
                                                            className="mb-2 last:mb-0 font-bold"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </p>
                                                    ),
                                                    strong: ({children, ...props}) => (
                                                        <strong 
                                                            className="font-extrabold"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 200, 100)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </strong>
                                                    ),
                                                    ul: ({children, ...props}) => (
                                                        <ul 
                                                            className="list-disc list-inside my-2 space-y-1 font-bold"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </ul>
                                                    ),
                                                    ol: ({children, ...props}) => (
                                                        <ol 
                                                            className="list-decimal list-inside my-2 space-y-1 font-bold"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </ol>
                                                    ),
                                                    li: ({children, ...props}) => (
                                                        <li 
                                                            className="ml-2 font-bold"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </li>
                                                    ),
                                                    h1: ({children, ...props}) => (
                                                        <h1 
                                                            className="text-xl font-extrabold mb-2 mt-3 first:mt-0"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </h1>
                                                    ),
                                                    h2: ({children, ...props}) => (
                                                        <h2 
                                                            className="text-lg font-extrabold mb-2 mt-3 first:mt-0"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </h2>
                                                    ),
                                                    h3: ({children, ...props}) => (
                                                        <h3 
                                                            className="text-base font-extrabold mb-1 mt-2 first:mt-0"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </h3>
                                                    ),
                                                   
                                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                    code: ({inline, children, ...props}: any) => {
                                                        const isInline = inline;
                                                        return isInline ? (
                                                            <code 
                                                                className="px-1 py-0.5 rounded text-sm font-bold bg-slate-200 dark:bg-slate-700"
                                                                style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <code 
                                                                className="block p-2 rounded my-2 text-sm font-bold bg-slate-200 dark:bg-slate-700"
                                                                style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    blockquote: ({children, ...props}) => (
                                                        <blockquote 
                                                            className="border-l-4 border-accent pl-3 italic my-2 font-bold"
                                                            style={message.role === "assistant" ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(255, 255, 255)' }}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    </motion.div>
                                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 px-2" suppressHydrationWarning>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Quick Actions - Show when messages are few */}
                    {messages.length <= 1 && !isLoading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap gap-3 justify-center mt-8"
                        >
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleQuickAction(t(action.key))}
                                        className="group glass-card bg-white/70 dark:bg-background/60 backdrop-blur-xl border border-foreground/20 dark:border-foreground/10 hover:border-accent/50 px-4 py-3 rounded-xl shadow-lg hover:shadow-accent/20 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-accent group-hover:rotate-12 transition-transform" />
                                            <span className="text-sm font-medium text-foreground dark:text-foreground">
                                                {t(action.key)}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-3"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent to-teal rounded-full blur-sm animate-pulse"></div>
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent to-teal p-1 shadow-lg">
                                    <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-accent" />
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card bg-white/80 dark:bg-background/90 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg border border-foreground/20 dark:border-foreground/10">
                                <div className="flex space-x-2">
                                    <motion.div 
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity }}
                                        className="w-2 h-2 bg-accent rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                        className="w-2 h-2 bg-accent rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                        className="w-2 h-2 bg-accent rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 z-40 border-t border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t("mentor.typeMessage")}
                                rows={1}
                                className={cn(
                                    "w-full px-4 py-3 pr-12 rounded-2xl border-2 resize-none transition-all duration-200 outline-none shadow-lg",
                                    "focus:border-accent focus:shadow-[0_0_30px_rgba(251,146,60,0.2)]",
                                    theme === "light"
                                        ? "bg-white border-foreground/20 text-foreground"
                                        : "bg-foreground/5 border-foreground/20 text-foreground"
                                )}
                                style={{
                                    minHeight: "48px",
                                    maxHeight: "120px",
                                }}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "h-12 w-12 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center justify-center",
                                !input.trim() || isLoading
                                    ? "opacity-50 cursor-not-allowed bg-muted"
                                    : "bg-gradient-to-r from-accent to-orange-600 hover:shadow-orange-500/40 hover:scale-110 active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-foreground/50 mt-2 text-center">
                        {t("mentor.pressEnter")}
                    </p>
                </div>
            </div>
        </div>
    );
}
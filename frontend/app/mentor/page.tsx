"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/store/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function MentorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { t } = useI18n();
    const { theme } = useTheme();
    const { setLanguage } = useI18n();
    const [showLanguagePopup, setShowLanguagePopup] = useState(true);

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
                content: "Hello! 👋 I'm your AI career mentor from UdaanSetu. I'm here to help you discover your skills, build your future, and guide you from rural dreams to digital careers. How can I assist you today?",
                timestamp: new Date(),
            },
        ]);
    }, []);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `That's a great question! As your AI mentor, I can help you with:\n\n• Career guidance and planning\n• Skill development recommendations\n• Job market insights\n• Educational pathways\n• Interview preparation\n\nCould you tell me more about what specific area you'd like to explore?`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary-indigo/5 relative">
            {/* Language Preference Popup */}
            {mounted && showLanguagePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in-fade">
                    <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 glass-card animate-in-scale">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-2xl">🌐</span>
                            </div>
                            <h2 className="text-xl font-bold mb-2">Select Language</h2>
                            <p className="text-foreground/70 text-sm">Please choose your preferred language to continue</p>
                            <p className="text-foreground/70 text-sm mt-1">આગળ વધવા માટે કૃપા કરીને તમારી પસંદગીની ભાષા પસંદ કરો</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={() => handleLanguageSelect("en")}
                                className="bg-gradient-to-r from-primary-indigo to-primary-navy hover:scale-105 transition-transform"
                            >
                                English
                            </Button>
                            <Button
                                onClick={() => handleLanguageSelect("gu")}
                                className="bg-gradient-to-r from-accent to-orange-600 hover:scale-105 transition-transform"
                            >
                                ગુજરાતી
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-3 animate-in-scale",
                                message.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {message.role === "assistant" ? (
                                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent to-teal p-1 shadow-lg">
                                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                                            <Image
                                                src="/logo.png"
                                                alt="Mentor"
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-indigo to-primary-navy flex items-center justify-center text-white font-bold shadow-lg">
                                        {user?.displayName?.[0] || user?.email?.[0] || "U"}
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
                                <div
                                    className={cn(
                                        "px-4 py-3 rounded-2xl shadow-md transition-all duration-200",
                                        message.role === "assistant"
                                            ? "glass-card bg-background/80 dark:bg-foreground/5 text-foreground border border-foreground/10"
                                            : "bg-gradient-to-r from-primary-indigo to-primary-navy text-white"
                                    )}
                                >
                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                                        {message.content}
                                    </p>
                                </div>
                                <span className="text-xs text-foreground/50 mt-1 px-2" suppressHydrationWarning>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-3 animate-in-scale">
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent to-teal p-1 shadow-lg">
                                <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                                    <Image
                                        src="/logo.png"
                                        alt="Mentor"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <div className="glass-card bg-background/80 dark:bg-foreground/5 px-4 py-3 rounded-2xl shadow-md">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce animation-delay-200"></div>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce animation-delay-400"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 border-t border-foreground/10 bg-background/95 backdrop-blur-md shadow-2xl">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t("chatbot.placeholder") || "Type your message..."}
                                rows={1}
                                className={cn(
                                    "w-full px-4 py-3 pr-12 rounded-2xl border-2 resize-none transition-all duration-200 outline-none",
                                    "focus:border-accent focus:shadow-[0_0_20px_rgba(251,146,60,0.15)]",
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
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "h-12 px-6 rounded-2xl font-semibold shadow-lg transition-all duration-300",
                                !input.trim() || isLoading
                                    ? "opacity-50 cursor-not-allowed bg-muted"
                                    : "bg-gradient-to-r from-accent to-orange-600 hover:shadow-orange-500/30 hover:scale-105"
                            )}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg
                                    className="w-5 h-5 rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-foreground/50 mt-2 text-center">
                        Press Enter to send • Shift + Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}

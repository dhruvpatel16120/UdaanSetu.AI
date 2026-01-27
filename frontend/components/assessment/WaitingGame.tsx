"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Zap, Fingerprint } from "lucide-react";

interface WaitingGameProps {
    onComplete: () => void;
    status: string;
}

interface Orb {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
}

export function WaitingGame({ onComplete, status }: WaitingGameProps) {
    const [score, setScore] = useState(0);
    const [orbs, setOrbs] = useState<Orb[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timeLeft, setTimeLeft] = useState(100); // Progress bar basically

    // Initialize Orbs
    useEffect(() => {
        const createOrb = () => ({
            id: Math.random(),
            x: Math.random() * 80 + 10, // %
            y: Math.random() * 80 + 10, // %
            size: Math.random() * 40 + 30,
            color: ["#f59e0b", "#d97706", "#7c3aed", "#ec4899"][Math.floor(Math.random() * 4)],
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
        });

        const initialOrbs = Array.from({ length: 5 }).map(createOrb);
        setOrbs(initialOrbs);

        const interval = setInterval(() => {
            setOrbs(prev => prev.map(orb => {
                let newX = orb.x + orb.speedX;
                let newY = orb.y + orb.speedY;

                // Bounce
                if (newX <= 0 || newX >= 100) orb.speedX *= -1;
                if (newY <= 0 || newY >= 100) orb.speedY *= -1;

                return { ...orb, x: newX, y: newY };
            }));
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const handleOrbClick = (id: number) => {
        setScore(curr => curr + 10);
        // Remove orb and add new one
        setOrbs(prev => prev.map(orb => 
            orb.id === id ? {
                ...orb,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                color: ["#f59e0b", "#d97706", "#7c3aed", "#ec4899"][Math.floor(Math.random() * 4)],
            } : orb
        ));
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-center" ref={containerRef}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden min-h-[500px] flex flex-col items-center justify-between"
            >
                {/* Header */}
                <div className="relative z-10 w-full flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <Brain className="w-5 h-5 text-accent animate-pulse" />
                        <span className="font-semibold text-foreground/80 text-sm tracking-wide uppercase">
                            Analysis in Progress
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="font-bold text-accent">{score} Focus Points</span>
                    </div>
                </div>

                {/* Game Area */}
                <div className="absolute inset-0 top-20 bottom-20 z-0">
                    <AnimatePresence>
                        {orbs.map((orb) => (
                            <motion.button
                                key={orb.id}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    left: `${orb.x}%`, 
                                    top: `${orb.y}%`, 
                                    scale: 1, 
                                    opacity: 0.8 
                                }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                onClick={() => handleOrbClick(orb.id)}
                                className="absolute rounded-full cursor-pointer hover:brightness-125 active:scale-95 transition-all shadow-lg backdrop-blur-sm flex items-center justify-center group"
                                style={{
                                    width: orb.size,
                                    height: orb.size,
                                    backgroundColor: orb.color + "40", // 25% opacity
                                    borderColor: orb.color,
                                    borderWidth: "2px"
                                }}
                            >
                                <div className="w-full h-full rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Status Text overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="text-center opacity-10">
                        <Fingerprint className="w-64 h-64 mx-auto mb-4" />
                    </div>
                </div>

                {/* Footer Status */}
                <div className="relative z-10 w-full bg-background/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 mt-auto">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                        {status}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Collect light orbs to calibrate your focus profile while we analyze your data.
                    </p>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-accent to-purple-500"
                            animate={{ 
                                x: ["-100%", "100%"] 
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "linear" 
                            }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

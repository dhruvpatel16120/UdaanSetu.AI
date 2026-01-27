"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ENV } from "@/constants/env";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/store/theme/ThemeProvider";
import { motion } from "framer-motion";
import { User, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

export default function EditProfilePage() {
    const { user, status } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        educationLevel: "",
        personalInterests: "",
        careerGoals: ""
    });

    // Reference state to track changes
    const [serverData, setServerData] = useState<typeof formData | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!user) {
            router.push(ROUTES.auth.signIn);
            return;
        }

        async function fetchProfile() {
            try {
                setError(null);
                const res = await fetch(`${ENV.apiUrl}/api/user/${user?.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    const initialData = {
                        name: data.name || user?.displayName || "",
                        educationLevel: data.educationLevel || "",
                        personalInterests: data.personalInterests || "",
                        careerGoals: data.careerGoals || ""
                    };
                    setFormData(initialData);
                    setServerData(initialData);
                } else {
                    throw new Error("Failed to fetch profile settings");
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                setError("Unable to load profile data. Please check your connection.");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user, status, router]);

    // Check if form has changed
    const hasChanges = useMemo(() => {
        if (!serverData) return false;
        return (
            formData.name !== serverData.name ||
            formData.educationLevel !== serverData.educationLevel ||
            formData.personalInterests !== serverData.personalInterests ||
            formData.careerGoals !== serverData.careerGoals
        );
    }, [formData, serverData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final sanity check for changes
        if (!hasChanges) {
            toast.info("No changes to save");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${ENV.apiUrl}/api/user/${user?.uid}/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || "Update failed");
            }

            toast.success("Profile updated successfully");
            
            // Update local serverData reference so button disables again
            setServerData({...formData});
            
            // Optionally redirect or stay on page
            setTimeout(() => router.push(ROUTES.profile), 1000);
        } catch (err: any) {
            console.error("Update failed", err);
            toast.error(err.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className={cn(
            "min-h-screen py-12 px-4 transition-colors duration-500",
            theme === "dark" ? "bg-[#020617]" : "bg-zinc-50"
        )}>
            <div className="max-w-2xl mx-auto">

                <Link href={ROUTES.profile} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-10 bg-white dark:bg-zinc-900 border-border overflow-hidden"
                >
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                        <div className="p-3 bg-accent/10 rounded-full">
                            <User className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Profile</h1>
                            <p className="text-muted-foreground text-sm">Update your personal details</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all"
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Education Level</label>
                            <div className="relative">
                                <select
                                    value={formData.educationLevel}
                                    onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Level</option>
                                    <option value="Class 8-10">Class 8-10</option>
                                    <option value="Class 11-12">Class 11-12</option>
                                    <option value="Undergraduate">Undergraduate</option>
                                    <option value="Postgraduate">Postgraduate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Personal Interests</label>
                            <textarea
                                rows={3}
                                value={formData.personalInterests}
                                onChange={e => setFormData({ ...formData, personalInterests: e.target.value })}
                                className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all resize-none"
                                placeholder="e.g. Drawing, Coding, Cricket..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Career Goal</label>
                            <input
                                type="text"
                                value={formData.careerGoals}
                                onChange={e => setFormData({ ...formData, careerGoals: e.target.value })}
                                className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all"
                                placeholder="e.g. Software Engineer, Doctor..."
                            />
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                            <Link href={ROUTES.profile} className="w-full sm:w-auto">
                                <Button type="button" variant="ghost" className="w-full">Cancel</Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={saving || !hasChanges} 
                                className={cn(
                                    "w-full sm:w-40 transition-all duration-300",
                                    !hasChanges ? "opacity-50 cursor-not-allowed" : "bg-accent text-white hover:shadow-lg hover:shadow-accent/20"
                                )}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" /> Save Changes
                                    </>
                                )}
                            </Button>
                        </div>

                    </form>

                </motion.div>
            </div>
        </div>
    );
}

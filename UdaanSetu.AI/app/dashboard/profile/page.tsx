"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/Button";

// Placeholder User Profile Page
// In a real app, this would fetch user data from Firestore/Auth

export default function UserProfilePage() {
  const { t } = useI18n();

  // Mock User Data
  const user = {
    name: "Dhruv Patel",
    email: "dhruv@example.com",
    role: "Student",
    joinDate: "January 2025"
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        
        {/* Profile Header */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-6">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-indigo to-accent-teal flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.name.charAt(0)}
           </div>
           <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-foreground/60">{user.email}</p>
              <div className="flex gap-2 justify-center md:justify-start mt-2">
                 <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase">{user.role}</span>
                 <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground/60 text-xs">Joined {user.joinDate}</span>
              </div>
           </div>
           <Button variant="outline">Edit Profile</Button>
        </div>

        {/* Quick Stats / Dashboard */}
        <div className="grid md:grid-cols-3 gap-6">
           <div className="glass-card p-6 border-l-4 border-accent">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase">Assessment Status</h3>
              <p className="text-2xl font-bold mt-1 text-green-600">Completed</p>
              <p className="text-xs text-foreground/50 mt-2">Last taken: Just now</p>
           </div>
           <div className="glass-card p-6 border-l-4 border-primary-indigo">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase">Career Paths</h3>
              <p className="text-2xl font-bold mt-1">3 Generated</p>
              <a href="/assessment/result" className="text-xs text-primary-indigo mt-2 inline-block hover:underline">View latest report →</a>
           </div>
           <div className="glass-card p-6 border-l-4 border-teal-500">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase">Learning Progress</h3>
              <p className="text-2xl font-bold mt-1">0%</p>
              <p className="text-xs text-foreground/50 mt-2">Start a roadmap to track progress</p>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-8">
           <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
           <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                 <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                    <p className="font-medium">Completed Career Assessment</p>
                    <p className="text-sm text-foreground/50">Today</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

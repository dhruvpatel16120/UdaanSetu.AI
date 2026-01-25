"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/Button";

// This would typically fetch data from the backend or access it via a global state/context if available immediately.
// Since we are using Firestore 1:1, we can fetch it, but for a smoother transition, 
// the completion screen in `BackendQASection` currently just shows "Done".
// We will create this as a placeholder for the dedicated "Result View" page.

export default function ResultPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 animate-slide-up">
           <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-indigo to-accent-teal bg-clip-text text-transparent mb-6">
             Your Assessment Profile
           </h1>
           <p className="text-foreground/70 mb-8">
             We have captured your bio-data and key traits. The AI Counselor is analyzing this data to generate your personalized path.
           </p>

           <div className="p-6 bg-accent/5 rounded-xl border border-accent/10 mb-8">
             <h3 className="font-semibold text-lg mb-2">Status</h3>
             <div className="flex items-center gap-2 text-green-600 font-medium">
               <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
               Data Stored Successfully
             </div>
             <p className="text-sm text-foreground/60 mt-2">
               Your responses have been securely saved to your profile.
             </p>
           </div>

           <Button className="w-full sm:w-auto">
             Generate AI Career Roadmap →
           </Button>
        </div>
      </div>
    </div>
  );
}

import { BackendQASection } from "@/components/assessment/BackendQASection";
import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen py-12 relative">
      {/* Language toggle in top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <BackendQASection />
    </div>
  );
}

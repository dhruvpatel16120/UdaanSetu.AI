import { HeroSection } from "@/components/layout/HeroSection";
import { ValuePropositions } from "@/components/home/ValuePropositions";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ValuePropositions />
      <Features />
      <HowItWorks />
      <CTASection />
    </main>
  );
}

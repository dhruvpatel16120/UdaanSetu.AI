import { AboutHero } from "@/components/about/AboutHero";
import { ProblemStatement } from "@/components/about/ProblemStatement";
import { Solution } from "@/components/about/Solution";
import { Objective } from "@/components/about/Objective";
import { Team } from "@/components/about/Team";

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <ProblemStatement />
      <Solution />
      <Objective />
      <Team />
    </main>
  );
}

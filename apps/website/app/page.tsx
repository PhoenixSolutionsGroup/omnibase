import {
  ProblemSection,
  FeaturesSection,
  CodeSnippetSection,
  ComparisonSection,
  PricingSection,
  OpenSourceSection,
  CTASection,
  UseCaseSection,
  HeroSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <CodeSnippetSection />
      <PricingSection />
      <UseCaseSection />
      <ComparisonSection />
      <OpenSourceSection />
      <CTASection />
    </>
  );
}

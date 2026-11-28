import {
	CodeSnippetSection,
	ComparisonSection,
	CTASection,
	FeaturesSection,
	HeroSection,
	OpenSourceSection,
	PricingSection,
	ProblemSection,
	UseCaseSection,
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

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Self-Hosted",
    price: "Free",
    period: "forever",
    description:
      "Run Omnibase on your own infrastructure. Full feature parity, no limitations.",
    features: [
      "All features included",
      "Your infrastructure, your data",
      "Community support",
      "No usage limits",
    ],
    cta: "Self-Hosting Guide",
    ctaHref: "https://docs.omnibase.tech/self-hosting",
    variant: "outline" as const,
  },
  {
    name: "Shared",
    price: "Free",
    period: "to start",
    description:
      "Managed hosting on shared infrastructure. Great for getting started and scaling up.",
    features: [
      "No infrastructure to manage",
      "Scales with your usage",
      "Standard support",
      "Usage-based pricing as you grow",
    ],
    cta: "Get Started Free",
    ctaHref: "https://omnibase.tech/signup",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Dedicated",
    price: "From $19.99",
    period: "/month",
    description:
      "Isolated compute and database for production workloads. Predictable performance, priority support.",
    features: [
      "Dedicated resources",
      "Better for compliance requirements",
      "Priority support",
      "Predictable performance",
    ],
    cta: "Get Started",
    ctaHref: "https://omnibase.tech/signup",
    variant: "outline" as const,
  },
];

export function PricingSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale when you&apos;re ready. No surprises.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.variant}
                  className="w-full"
                  asChild
                >
                  <Link
                    href={plan.ctaHref}
                    {...(plan.ctaHref.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

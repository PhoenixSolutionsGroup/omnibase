import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, CreditCard, HardDrive, Key, Shield, Users } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Multi-Tenancy",
    description:
      "Schema-based tenant isolation out of the box. Create tenants, switch contexts, and manage shared user identities without writing RLS policies.",
    href: "https://docs.omnibase.tech/guides/multi-tenancy",
  },
  {
    icon: Shield,
    title: "RBAC",
    description:
      "Define roles and permissions that make sense for your app. Built on Ory Keto for production-grade authorization without the complexity.",
    href: "https://docs.omnibase.tech/guides/rbac",
  },
  {
    icon: CreditCard,
    title: "Stripe as Code",
    description:
      "Define your products, prices, and billing logic in config files. Push changes with the CLI. Omnibase keeps Stripe in sync.",
    href: "https://docs.omnibase.tech/guides/stripe",
  },
  {
    icon: Key,
    title: "Authentication",
    description:
      "Secure auth powered by Ory Kratos. Social logins, magic links, MFA. Configured, not coded.",
    href: "https://docs.omnibase.tech/guides/authentication",
  },
  {
    icon: HardDrive,
    title: "Storage",
    description:
      "File storage with tenant-aware access controls. Upload, serve, and manage files without bolting on another service.",
    href: "https://docs.omnibase.tech/guides/storage",
  },
  {
    icon: Users,
    title: "Self-Hosting",
    description:
      "Run Omnibase on your own infrastructure with full feature parity. Docker Compose up and you're live.",
    href: "https://docs.omnibase.tech/self-hosting",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ship SaaS
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop rebuilding the same infrastructure. Focus on what makes your
            product unique.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group relative overflow-hidden">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={feature.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

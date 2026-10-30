import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  CreditCard,
  HardDrive,
  Lock,
  Shield,
  Users,
} from "lucide-react";
import { Storage } from "./features /storage";
import { Authentication } from "./features /authentication";
import { Roles } from "./features /roles";
import { Payments } from "./features /payments";
import { Hosting } from "./features /hosting";
import { MultiTenancy } from "./features /multi-tenancy";

const features = [
  {
    icon: Shield,
    title: "Roles & Permissions",
    description:
      "Define custom roles and permissions. Allow users to only see and do what their roles permit, all without touching a single line of code.",
    href: "https://docs.omnibase.tech/guides/rbac",
    content: <Roles />,
  },
  {
    icon: CreditCard,
    title: "Stripe as Code",
    description:
      "Products, prices, subscription, coupons, promotion codes and webhooks. Ready to use out of the box.",
    href: "https://docs.omnibase.tech/guides/stripe",
    content: <Payments />,
  },
  {
    icon: Lock,
    title: "Authentication",
    description:
      "Secure logins and sign ups powered by Ory Kratos. Social logins, magic links, MFA. All configured, no code needed.",
    href: "https://docs.omnibase.tech/guides/authentication",
    content: <Authentication />,
  },
  {
    icon: HardDrive,
    title: "Storage",
    description:
      "File storage with tenant-aware access controls. Upload, serve, and manage files without bolting on another service.",
    href: "https://docs.omnibase.tech/guides/storage",
    content: <Storage />,
  },
  {
    icon: Users,
    title: "Self-Hosting",
    description:
      "Use our free managed hosting or run Omnibase on your own infrastructure. Go live in minutes.",
    href: "https://docs.omnibase.tech/self-hosting",
    content: <Hosting />,
  },
  {
    icon: Building2,
    title: "Multi-Tenancy",
    description:
      "First-class tenant context switching with JWTs. RLS policies use auth.active_tenant_id(). Custom roles per organization.",
    href: "https://docs.omnibase.tech/guides/multi-tenancy",
    content: <MultiTenancy />,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ship your idea
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop rebuilding the same infrastructure again and again. Focus on
            what makes your product unique and ship it today.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative cursor-pointer"
            >
              <Card className="h-full overflow-hidden transition-shadow duration-300 group-hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <feature.icon className="h-6 w-6" />
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  {feature.content}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

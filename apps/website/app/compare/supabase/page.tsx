import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Omnibase vs Supabase | Comparison",
  description:
    "Compare Omnibase and Supabase for building multi-tenant SaaS applications. See the differences in multi-tenancy, RBAC, and Stripe integration.",
};

const comparisonData = [
  {
    feature: "Native multi-tenancy",
    omnibase: "First-class tenant context with RLS helpers",
    supabase: "Manual RLS policies per table",
  },
  {
    feature: "RBAC / Permissions",
    omnibase: "Built-in with Ory Keto (ReBAC)",
    supabase: "DIY with Custom Claims + RLS",
  },
  {
    feature: "Stripe integration",
    omnibase: "Declarative config, CLI sync, auto webhooks",
    supabase: "Sync Engine (one-way) or manual",
  },
  {
    feature: "Open source",
    omnibase: true,
    supabase: true,
  },
  {
    feature: "PostgreSQL",
    omnibase: true,
    supabase: true,
  },
];

function renderValue(value: string | boolean) {
  if (value === true) return <Check className="h-5 w-5 text-green-600" />;
  if (value === false) return <X className="h-5 w-5 text-red-500" />;
  return <span className="text-sm">{value}</span>;
}

export default function SupabaseComparisonPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Omnibase vs Supabase
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Both are open-source backends built on PostgreSQL. Omnibase focuses
            on multi-tenant SaaS with built-in permissions and billing.
          </p>
        </div>

        {/* Opening */}
        <section className="mb-12">
          <p className="text-muted-foreground">
            Supabase is a solid open-source backend with a generous free tier
            and strong Postgres foundation. Omnibase builds on similar
            principles but focuses specifically on the needs of SaaS
            applications: native multi-tenancy, built-in RBAC, and declarative
            Stripe integration.
          </p>
        </section>

        {/* Comparison Points */}
        <section className="space-y-10 mb-16">
          <div>
            <h2 className="text-xl font-semibold mb-3">Multi-tenancy</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border bg-card">
                <p className="font-medium text-sm text-muted-foreground mb-2">
                  Supabase
                </p>
                <p className="text-sm">
                  Requires manual Row-Level Security (RLS) policies per table.
                  Works, but becomes complex and error-prone at scale.
                  Multi-tenancy is not yet supported in Supabase Auth.
                </p>
              </div>
              <div className="p-4 border bg-card">
                <p className="font-medium text-sm text-muted-foreground mb-2">
                  Omnibase
                </p>
                <p className="text-sm">
                  First-class tenant context switching. When users switch
                  tenants, they get a new JWT with the active tenant ID. RLS
                  policies use the built-in <code>auth.active_tenant_id()</code>{" "}
                  helper. RBAC/ReBAC via Ory Keto for fine-grained permissions.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              RBAC / Permissions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border bg-card">
                <p className="font-medium text-sm text-muted-foreground mb-2">
                  Supabase
                </p>
                <p className="text-sm">
                  No built-in role system beyond Postgres roles. RBAC requires
                  Custom Claims via Auth Hooks combined with RLS policies. JWT
                  changes require re-login to take effect.
                </p>
              </div>
              <div className="p-4 border bg-card">
                <p className="font-medium text-sm text-muted-foreground mb-2">
                  Omnibase
                </p>
                <p className="text-sm">
                  Role-based access control built on Ory Keto (ReBAC). Define
                  roles and permissions that map to your app&apos;s domain.
                  Changes take effect immediately.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Stripe / Billing</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border bg-card">
                <p className="font-medium text-sm text-muted-foreground mb-2">
                  Supabase
                </p>
                <p className="text-sm">
                  Stripe Sync Engine provides one-way sync from Stripe to your
                  database. Foreign Data Wrapper for querying Stripe. Webhook
                  handling and product management is manual.
                </p>
              </div>
              <div className="p-4 border bg-card">
                <p className="font-medium text-sm text-muted-foreground mb-2">
                  Omnibase
                </p>
                <p className="text-sm">
                  Declarative Stripe config in JSON. Define products and prices
                  in code, push with CLI. Webhooks handled automatically. Two-way
                  sync.
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* Summary Table */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4">At a glance</h2>
          <div className="border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Feature</th>
                  <th className="text-left p-3 font-medium">Omnibase</th>
                  <th className="text-left p-3 font-medium">Supabase</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="border-b last:border-b-0">
                    <td className="p-3 font-medium">{row.feature}</td>
                    <td className="p-3">{renderValue(row.omnibase)}</td>
                    <td className="p-3">{renderValue(row.supabase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">See how Omnibase works</h2>
          <p className="text-muted-foreground mb-6">
            Get started with the quickstart guide or explore the documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="https://docs.omnibase.tech/quickstart">
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://docs.omnibase.tech">Read the Docs</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

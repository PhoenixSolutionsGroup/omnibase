import { AlertTriangle, Code2, CreditCard, Lock, Server } from "lucide-react";

const painPoints = [
  {
    icon: Server,
    text: "Building multi-tenancy from scratch is tedious and error-prone",
  },
  {
    icon: Lock,
    text: "Row-level security policies become unmaintainable as complexity grows",
  },
  {
    icon: CreditCard,
    text: "Integrating Stripe means weeks of webhook handling and state syncing",
  },
  {
    icon: Code2,
    text: "RBAC systems are either too simple or require a PhD to configure",
  },
  {
    icon: AlertTriangle,
    text: "Most backend solutions force you to choose between managed convenience and self-hosted control",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Building SaaS infrastructure is painful
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            You&apos;ve been there. Weeks spent on plumbing instead of building
            what makes your product unique.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border bg-background p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <point.icon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{point.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

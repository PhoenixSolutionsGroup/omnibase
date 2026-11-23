"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface StripeSettingsClientProps {
  stripeAccountId: string;
  stripeEnvironment?: string | null;
  isOnboarded: boolean;
  onboardingUrl?: string;
}

interface DashboardLinkCardProps {
  label: string;
  href: string;
  isOnboarded: boolean;
}

function DashboardLinkCard({
  label,
  href,
  isOnboarded,
}: DashboardLinkCardProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={`flex w-full justify-between py-6! ${
        !isOnboarded ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <a
        href={isOnboarded ? href : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!isOnboarded}
        tabIndex={isOnboarded ? undefined : -1}
      >
        <span>{label}</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  );
}

export function StripeSettingsClient({
  stripeAccountId,
  stripeEnvironment,
  isOnboarded,
  onboardingUrl,
}: StripeSettingsClientProps) {
  const isTestMode = stripeEnvironment === "sandbox";

  // Generate Stripe Dashboard deep links
  const dashboardBase = isTestMode
    ? `https://dashboard.stripe.com/test/${stripeAccountId}`
    : `https://dashboard.stripe.com/${stripeAccountId}`;

  const dashboardLinks = [
    {
      label: "Branding (Logo, Colors)",
      href: `${dashboardBase}/settings/branding`,
    },
    { label: "Customer Emails", href: `${dashboardBase}/settings/emails` },
    { label: "Custom Domains", href: `${dashboardBase}/settings/public` },
    { label: "Account Settings", href: `${dashboardBase}/settings/account` },
  ];

  const showOnboardingCta = !isOnboarded && !!onboardingUrl;

  return (
    <div className="space-y-6">
      {/* Show onboarding notice if not complete */}
      {showOnboardingCta && (
        <Card className="ring-warning bg-warning/10">
          <CardHeader>
            <CardTitle>Stripe Onboarding Required</CardTitle>
            <CardDescription>
              Please complete Stripe onboarding to access these settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex">
              <Button variant="outline">
                <Link href={onboardingUrl}>Finish Stripe Onboarding</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isTestMode && (
        <Card className="ring-info bg-info/10">
          <CardHeader>
            <CardTitle>Sandbox Mode</CardTitle>
            <CardDescription>
              This branch uses a sandbox (test) Stripe account. No onboarding is
              required and all charges are in test mode.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Quick Links to Stripe Dashboard Settings */}
      <Card className={`${!isOnboarded ? "opacity-50" : ""}`}>
        <CardHeader>
          <CardTitle>Stripe Dashboard Settings</CardTitle>
          <CardDescription>
            Configure your branding, custom domains, and customer email settings
            directly in your Stripe Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardLinks.map((link) => (
              <DashboardLinkCard
                key={link.label}
                label={link.label}
                href={link.href}
                isOnboarded={isOnboarded}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

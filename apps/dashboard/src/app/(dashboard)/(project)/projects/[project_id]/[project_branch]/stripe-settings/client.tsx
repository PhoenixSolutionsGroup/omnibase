"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="p-6 border-orange-300 dark:border-orange-700">
          <h2 className="text-lg font-semibold mb-2">
            Stripe Onboarding Required
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please complete Stripe onboarding to access these settings.
          </p>
          <div className="flex">
            <Button className="">
              <Link href={onboardingUrl}>Finish Stripe Onboarding</Link>
            </Button>
          </div>
        </Card>
      )}

      {isTestMode && (
        <Card className="p-6 border-blue-300 dark:border-blue-700">
          <h2 className="text-lg font-semibold mb-2">Sandbox Mode</h2>
          <p className="text-sm text-muted-foreground">
            This branch uses a sandbox (test) Stripe account. No onboarding is
            required and all charges are in test mode.
          </p>
        </Card>
      )}

      {/* Quick Links to Stripe Dashboard Settings */}
      <Card className={`p-6 ${!isOnboarded ? "opacity-50" : ""}`}>
        <h2 className="text-lg font-semibold mb-4">
          Stripe Dashboard Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your branding, custom domains, and customer email settings
          directly in your Stripe Dashboard.
        </p>
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
      </Card>
    </div>
  );
}

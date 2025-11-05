"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface StripeSettingsClientProps {
  stripeAccountId: string;
}

export function StripeSettingsClient({
  stripeAccountId,
}: StripeSettingsClientProps) {
  // Generate Stripe Dashboard deep links
  const stripeDashboardUrls = {
    branding: `https://dashboard.stripe.com/${stripeAccountId}/settings/branding`,
    emails: `https://dashboard.stripe.com/${stripeAccountId}/settings/emails`,
    domains: `https://dashboard.stripe.com/${stripeAccountId}/settings/public`,
    account: `https://dashboard.stripe.com/${stripeAccountId}/settings/account`,
  };

  return (
    <div className="space-y-6">
      {/* Quick Links to Stripe Dashboard Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Stripe Dashboard Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your branding, custom domains, and customer email settings
          directly in your Stripe Dashboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={stripeDashboardUrls.branding}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="font-medium">Branding (Logo, Colors)</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <a
            href={stripeDashboardUrls.emails}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="font-medium">Customer Emails</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <a
            href={stripeDashboardUrls.domains}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="font-medium">Custom Domains</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <a
            href={stripeDashboardUrls.account}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="font-medium">Account Settings</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </Card>
    </div>
  );
}

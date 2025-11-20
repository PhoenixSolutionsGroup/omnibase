"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Database } from "@/types/database";

export type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectProvisioningDashboardProps {
  project: Project;
}

export function ProjectProvisioningDashboard({
  project,
}: ProjectProvisioningDashboardProps) {
  useEffect(() => {
    const checkStripeOnboarding = async () => {
      if (project.stripe_customer_id && !project.stripe_onboarding_complete) {
        try {
          const returnTo = encodeURIComponent(window.location.href);
          const response = await fetch(
            `/api/projects/${project.id}/stripe-onboarding?return_to=${returnTo}`
          );
          const data = await response.json();

          if (data.onboarding_required && data.url) {
            window.location.href = data.url;
          }
        } catch (error) {
          console.error("Failed to check Stripe onboarding:", error);
        }
      }
    };

    checkStripeOnboarding();
  }, [
    project.id,
    project.stripe_customer_id,
    project.stripe_onboarding_complete,
  ]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Provisioning Project
          </h1>
          <p className="text-lg text-muted-foreground">
            You will be redirected to Stripe shortly for onboarding (if not done
            already)
          </p>
        </div>
      </div>
    </div>
  );
}

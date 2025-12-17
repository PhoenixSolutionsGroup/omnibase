import React from "react";
import { StripeSettingsClient } from "./client";
import { getProject } from "@/utils/get-project";
import { cookies, headers } from "next/headers";
import Link from "next/link";

export default async function StripeSettingsPage({
  params,
}: {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}) {
  const { project_group_id, project_branch } = await params;

  // Get the project to check if Stripe is set up
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground">
          Unable to load project information.
        </p>
      </div>
    );
  }

  // Get the onboarding link if not complete
  let onboardingUrl = "#";
  if (!project.stripe_onboarding_complete) {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto");
    const currentUrl = `${protocol}://${host}/projects/${project_group_id}/${project_branch}/stripe-settings`;
    const returnTo = encodeURIComponent(currentUrl);

    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    try {
      const response = await fetch(
        `${process.env.MANAGED_HOSTING_API_URL}/api/v1/projects/${project.id}/stripe-onboarding-link?return_to=${returnTo}`,
        {
          headers: {
            Cookie: cookieHeader,
          },
        }
      );
      const data = await response.json();
      if (data.url) {
        onboardingUrl = data.url;
      }
    } catch (error) {
      console.error("Failed to fetch Stripe onboarding link:", error);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Stripe Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your branding, custom domains, and customer email settings.
        </p>
      </div>

      <StripeSettingsClient
        stripeAccountId={project.stripe_customer_id || ""}
        isOnboarded={project.stripe_onboarding_complete}
        onboardingUrl={onboardingUrl}
      />
    </div>
  );
}

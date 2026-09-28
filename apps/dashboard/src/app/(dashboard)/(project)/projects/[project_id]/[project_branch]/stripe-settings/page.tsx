import React from "react";
import { StripeSettingsClient } from "./client";
import { getProjectBranch } from "@/utils/get-project";
import { Project } from "../dashboard/project-provisioning-dashboard";
import { cookies, headers } from "next/headers";

export default async function StripeSettingsPage({
  params,
}: {
  params: Promise<{
    project_id: string;
    project_branch: string;
  }>;
}) {
  const { project_id, project_branch } = await params;

  // Get the project to check if Stripe is set up
  const project = (await getProjectBranch(project_id, project_branch)) as
    | Project
    | null;

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

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}/projects/${project_id}/${project_branch}/stripe-settings`;
  const returnTo = encodeURIComponent(currentUrl);

  const cookieStore = await cookies();
  const cookieHeader = Array.from(cookieStore.getAll())
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  let onboardingRequired = false;
  let onboardingUrl: string | undefined;

  try {
    const response = await fetch(
      `${process.env.MANAGED_HOSTING_API_URL}/api/v1/project_branches/${project.id}/stripe-onboarding-link?return_to=${returnTo}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );
    const data = await response.json();
    onboardingRequired = data.onboarding_required === true;
    onboardingUrl = data.url;
  } catch {
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
        stripeAccountId={project.stripe_account_id || ""}
        stripeEnvironment={project.stripe_environment}
        isOnboarded={!onboardingRequired}
        onboardingUrl={onboardingUrl}
      />
    </div>
  );
}
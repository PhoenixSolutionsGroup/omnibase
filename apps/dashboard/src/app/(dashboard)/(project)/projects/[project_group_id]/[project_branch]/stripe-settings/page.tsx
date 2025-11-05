import React from "react";
import { StripeSettingsClient } from "./client";
import { getProject } from "@/utils/get-project";

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

  if (!project.stripe_customer_id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Stripe Not Connected</h1>
        <p className="text-muted-foreground">
          Please complete Stripe onboarding before accessing these settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Stripe Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your branding, custom domains, and customer email settings.
        </p>
      </div>

      <StripeSettingsClient stripeAccountId={project.stripe_customer_id} />
    </div>
  );
}

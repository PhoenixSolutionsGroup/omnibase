import type { Metadata } from "next";
import { createServerClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { getProject } from "@/utils/get-project";
import { headers } from "next/headers";
import { UnifiedLayoutClient } from "@/components/layout-client";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ project_group_id: string; project_branch: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    redirect("/projects/new");
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}/projects/${project_group_id}/${project_branch}/dashboard`;
  const returnTo = encodeURIComponent(currentUrl);
  // Redirect to Stripe onboarding
  // const cookieStore = await cookies();
  // const cookieHeader = Array.from(cookieStore.getAll())
  //   .map((cookie) => `${cookie.name}=${cookie.value}`)
  //   .join("; ");

  // const response = await fetch(
  //   `${process.env.MANAGED_HOSTING_API_URL}/api/v1/projects/${project.id}/stripe-onboarding-link?return_to=${returnTo}`,
  //   {
  //     headers: {
  //       Cookie: cookieHeader,
  //     },
  //   }
  // );
  // const data = await response.json();

  // if (data.onboarding_required && data.url) {
  //   redirect(data.url);
  // }

  const db = await createServerClient();

  // Fetch all branches for this project group
  const { data: branches } = await db
    .from("projects")
    .select("branch_name")
    .eq("project_group_id", project_group_id)
    .order("branch_name");

  const branchNames = branches?.map((b) => b.branch_name || "main") || ["main"];

  // Fetch organization name from tenants table
  const { data: tenantData } = await (db as any)
    .schema("auth")
    .from("tenant_users")
    .select("tenants(*)")
    .eq("is_active", true)
    .single();

  const organizationName = tenantData?.tenants?.name || "My Organization";

  return (
    <UnifiedLayoutClient
      organizationName={organizationName}
      projectData={{
        projectId: project.id,
        projectGroupId: project_group_id,
        projectBranch: project.branch_name || "main",
        projectName: project.name,
        branches: branchNames,
      }}
    >
      {children}
    </UnifiedLayoutClient>
  );
}

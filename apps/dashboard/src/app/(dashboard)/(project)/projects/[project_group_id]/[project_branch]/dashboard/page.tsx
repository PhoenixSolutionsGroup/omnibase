import { createServerClient } from "@/lib/server";
import { notFound } from "next/navigation";
import { ProjectDashboardClient } from "./client";
import { ProjectProvisioningDashboard } from "./project-provisioning-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProject } from "@/utils/get-project";

interface ProjectDashboardPageProps {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}

export default async function ProjectDashboardPage({
  params,
}: ProjectDashboardPageProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }

  // If project is provisioning, show the provisioning dashboard
  if (project.stage === "provisioning") {
    return <ProjectProvisioningDashboard project={project} />;
  }

  // If project is in error state, show error
  if (project.stage === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-destructive">
              Provisioning Failed
            </h1>
            <p className="text-muted-foreground">
              There was an error provisioning {project.name}
            </p>
          </div>

          {project.error_message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-left font-mono bg-muted p-3 rounded">
                  {project.error_message}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show the normal dashboard for provisioned projects
  return <ProjectDashboardClient project={project} />;
}

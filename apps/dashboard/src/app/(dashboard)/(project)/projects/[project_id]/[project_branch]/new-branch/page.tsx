import { Metadata } from "next";
import { ProvisioningForm } from "@/components/provisioning-form";
import { getProjectBranch } from "@/utils/get-project";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "New Branch | OmniBase",
  description: "Create a new project branch",
};

interface NewBranchPageProps {
  params: Promise<{ project_id: string; project_branch: string }>;
}

export default async function NewBranchPage({ params }: NewBranchPageProps) {
  const { project_id, project_branch } = await params;
  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
        <p className="text-muted-foreground">
          Create a new branch for {project.name}. The branch will inherit the
          parent project's configuration.
        </p>
      </div>
      <ProvisioningForm
        mode="branch"
        projectId={project_id}
        projectName={project.name}
      />
    </div>
  );
}

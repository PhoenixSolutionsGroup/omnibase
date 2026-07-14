import { getProjectBranch } from "@/utils/get-project";
import { redirect } from "next/navigation";
import Studio from "@/components/studio/studio";

interface PageProps {
  params: Promise<{
    project_id: string;
    project_branch: string;
  }>;
}

export default async function StudioPage({ params }: PageProps) {
  const { project_id, project_branch } = await params;
  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    redirect("/projects/new");
  }

  return (
    <div
      className="h-[calc(100vh-4rem)] flex flex-col"
      data-testid="studio-page"
    >
      <Studio project={project} />
    </div>
  );
}

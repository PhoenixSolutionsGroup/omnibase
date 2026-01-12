import { getProject } from "@/utils/get-project";
import { redirect } from "next/navigation";
import Studio from "@/components/studio/studio";

interface PageProps {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}

export default async function StudioPage({ params }: PageProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

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

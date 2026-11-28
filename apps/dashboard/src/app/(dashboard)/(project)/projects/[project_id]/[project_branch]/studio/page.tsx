import { redirect } from "next/navigation";
import Studio from "@/components/studio/studio";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectBranch } from "@/utils/get-project";

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
		<div className="flex h-full min-h-0 flex-col py-4 md:py-8">
			<div className="mx-4 flex min-h-0 flex-1 flex-col gap-4 md:mx-8">
				{/* Header Section */}
				<div className="flex shrink-0 flex-col items-start justify-between gap-3 md:flex-row">
					<div>
						<h1 className="text-xl font-bold tracking-tight">
							Database Studio
						</h1>
						<p className="text-muted-foreground">Manage your database</p>
					</div>
				</div>
				<Card className="min-h-0 flex-1 overflow-hidden p-0">
					<CardContent className="h-full p-0">
						<div data-testid="studio-page" className="h-full">
							<Studio project={project} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

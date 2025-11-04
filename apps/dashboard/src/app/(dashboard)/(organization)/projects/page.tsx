import { createServerClient } from "@/lib/server";
import { ProjectsClient } from "./client";

export default async function ProjectsPage() {
  const db = await createServerClient();

  // Query the projects table
  const { data: projects, error } = await db
    .from("projects")
    .select("id, name, region, created_at")
    .eq("branch_name", "main")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    // Return empty array if there's an error
    return <ProjectsClient projects={[]} />;
  }

  // Transform the data to match the client component's expected format
  const formattedProjects = (projects || []).map((project) => ({
    id: project.id,
    name: project.name,
    region: project.region,
    created_at: project.created_at,
  }));

  return <ProjectsClient projects={formattedProjects} />;
}

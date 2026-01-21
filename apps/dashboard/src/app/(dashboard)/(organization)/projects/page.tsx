import { createServerClient } from "@/lib/server";
import { ProjectsClient } from "./client";

export default async function ProjectsPage() {
  const db = await createServerClient();

  // Query the projects table
  const { data: projects, error } = await db
    .from("projects")
    .select("id, name, created_at")
    .eq("branch_name", "main")
    .neq("status", "failed")
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    // Return empty array if there's an error
    return <ProjectsClient projects={[]} />;
  }

  return <ProjectsClient projects={projects} />;
}

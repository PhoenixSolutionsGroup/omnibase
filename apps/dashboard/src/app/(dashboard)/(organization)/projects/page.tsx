import { createServerClient } from "@/lib/server";
import { ProjectsClient } from "./client";

export default async function ProjectsPage() {
  try {
    const db = await createServerClient();

    const { data: projects, error } = await db
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return <ProjectsClient projects={[]} />;
    }

    return <ProjectsClient projects={projects} />;
  } catch {
    return <ProjectsClient projects={[]} />;
  }
}

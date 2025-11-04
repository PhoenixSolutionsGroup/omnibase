import { createServerClient } from "@/lib/server";
import { cache } from "react";

export const getProject = cache(
  async (projectGroupId: string, projectBranch: string) => {
    const db = await createServerClient();
    const { data: project, error } = await db
      .from("projects")
      .select("*")
      .eq("project_group_id", projectGroupId)
      .eq("branch_name", projectBranch)
      .single();

    if (error) {
      console.warn(error);
    }

    return project;
  }
);

export const getAllProjects = cache(async () => {
  const db = await createServerClient();
  const { data: projects, error } = await db
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(error);
  }

  return projects;
});

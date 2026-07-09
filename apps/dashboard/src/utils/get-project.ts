import { createServerClient } from "@/lib/server";
import { cache } from "react";

export const getProjectBranch = cache(
  async (projectId: string, branchName: string) => {
    const db = await createServerClient();
    const { data, error } = await db
      .from("project_branches")
      .select("*, project:projects!inner(name, tenant_id)")
      .eq("project_id", projectId)
      .eq("name", branchName)
      .single();

    if (error) {
      console.warn(error);
      return null;
    }

    const { project, name, ...branch } = data;
    return {
      ...branch,
      name: project.name,
      tenant_id: project.tenant_id,
      branch_name: name,
    };
  },
);

export const getProjectBranches = cache(async (projectId: string) => {
  const db = await createServerClient();
  const { data, error } = await db
    .from("project_branches")
    .select("*, project:projects!inner(name, tenant_id)")
    .eq("project_id", projectId)
    .order("name");

  if (error) {
    console.warn(error);
    return null;
  }

  return data.map(({ project, name, ...branch }) => ({
    ...branch,
    name: project.name,
    tenant_id: project.tenant_id,
    branch_name: name,
  }));
});

export const getAllProjectBranches = cache(async () => {
  const db = await createServerClient();
  const { data, error } = await db
    .from("project_branches")
    .select("*, project:projects!inner(name, tenant_id)")
    .in("status", ["active", "provisioning"])
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(error);
    return null;
  }

  return data.map(({ project, name, ...branch }) => ({
    ...branch,
    name: project.name,
    tenant_id: project.tenant_id,
    branch_name: name,
  }));
});

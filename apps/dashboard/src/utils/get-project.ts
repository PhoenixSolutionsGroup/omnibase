import { createServerClient } from "@/lib/server";
import { cache } from "react";

function withUrls<T extends { host: string | null }>(branch: T) {
  return {
    ...branch,
    api_url: branch.host ? `https://${branch.host}` : null,
    postgrest_url: branch.host ? `https://${branch.host}/api/v1/rest` : null,
    database_host: branch.host,
    database_pooler_host: branch.host,
  };
}

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
      ...withUrls(branch),
      name: project.name,
      tenant_id: project.tenant_id,
      branch_name: name,
    };
  },
);

export const getProjectBranches = cache(
  async (projectId: string, currentBranchName?: string) => {
    const db = await createServerClient();
    let query = db
      .from("project_branches")
      .select("*, project:projects!inner(name, tenant_id)")
      .eq("project_id", projectId);

    if (currentBranchName) {
      const quoted: string = currentBranchName
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');
      query = query.or(`status.eq.active,name.eq."${quoted}"`);
    } else {
      query = query.eq("status", "active");
    }

    const { data, error } = await query.order("name");

    if (error) {
      console.warn(error);
      return null;
    }

    return data.map(({ project, name, ...branch }) => ({
      ...withUrls(branch),
      name: project.name,
      tenant_id: project.tenant_id,
      branch_name: name,
    }));
  },
);

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
    ...withUrls(branch),
    name: project.name,
    tenant_id: project.tenant_id,
    branch_name: name,
  }));
});

export const getAllProjects = cache(async () => {
  const db = await createServerClient();
  const { data, error } = await db
    .from("projects")
    .select("id, name, tenant_id, project_branches!inner(status)")
    .in("project_branches.status", ["active", "provisioning"])
    .order("name");

  if (error) {
    console.warn(error);
    return null;
  }

  const seen = new Set<string>();
  const projects: { id: string; name: string; tenant_id: string }[] = [];

  for (const { id, name, tenant_id } of data) {
    if (seen.has(id)) continue;
    seen.add(id);
    projects.push({ id, name, tenant_id });
  }

  return projects;
});

-- AlterTable
ALTER TABLE "project_branches" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "project_branches_project_id_slug_key" ON "project_branches"("project_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- RLS policies
DROP POLICY IF EXISTS "project_branches_delete_auth" ON project_branches;
CREATE POLICY "project_branches_delete_auth" ON project_branches
  FOR DELETE
  USING ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())));

DROP POLICY IF EXISTS "projects_delete_auth" ON projects;
CREATE POLICY "projects_delete_auth" ON projects
  FOR DELETE
  USING (auth.user_id() IS NOT NULL);

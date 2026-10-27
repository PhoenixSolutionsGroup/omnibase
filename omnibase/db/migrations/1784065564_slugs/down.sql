
-- RLS policy rollback 1783421867_projects_rls
DROP POLICY IF EXISTS "project_branches_delete_auth" ON project_branches;
CREATE POLICY "project_branches_delete_auth" ON project_branches
  FOR DELETE
  USING ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())));

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS policy rollback 1783421867_projects_rls
DROP POLICY IF EXISTS "projects_delete_auth" ON projects;
CREATE POLICY "projects_delete_auth" ON projects
  FOR DELETE
  USING (auth.user_id() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON project_branches TO anon_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO anon_user;
-- DropIndex
DROP INDEX "public"."project_branches_project_id_slug_key";

-- DropIndex
DROP INDEX "public"."projects_slug_key";

-- AlterTable
ALTER TABLE "public"."project_branches" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "slug";

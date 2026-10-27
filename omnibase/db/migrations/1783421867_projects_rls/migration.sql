
-- RLS policies
ALTER TABLE project_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_branches_insert_auth" ON project_branches;
CREATE POLICY "project_branches_insert_auth" ON project_branches
  FOR INSERT
  WITH CHECK ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())));

DROP POLICY IF EXISTS "project_branches_select_auth" ON project_branches;
CREATE POLICY "project_branches_select_auth" ON project_branches
  FOR SELECT
  USING ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())));

DROP POLICY IF EXISTS "project_branches_update_auth" ON project_branches;
CREATE POLICY "project_branches_update_auth" ON project_branches
  FOR UPDATE
  USING ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())))
  WITH CHECK ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())));

DROP POLICY IF EXISTS "project_branches_delete_auth" ON project_branches;
CREATE POLICY "project_branches_delete_auth" ON project_branches
  FOR DELETE
  USING ((auth.user_id() IS NOT NULL AND EXISTS (SELECT 1 FROM projects project WHERE project.id = project_branches.project_id AND project.tenant_id::text = auth.active_tenant_id())));

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_insert_auth" ON projects;
CREATE POLICY "projects_insert_auth" ON projects
  FOR INSERT
  WITH CHECK ((auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "projects_select_auth" ON projects;
CREATE POLICY "projects_select_auth" ON projects
  FOR SELECT
  USING ((auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "projects_update_auth" ON projects;
CREATE POLICY "projects_update_auth" ON projects
  FOR UPDATE
  USING ((auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id()))
  WITH CHECK ((auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "projects_delete_auth" ON projects;
CREATE POLICY "projects_delete_auth" ON projects
  FOR DELETE
  USING (auth.user_id() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON project_branches TO anon_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO anon_user;

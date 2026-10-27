
DROP POLICY IF EXISTS "project_branches_insert_auth" ON project_branches;

DROP POLICY IF EXISTS "project_branches_select_auth" ON project_branches;

DROP POLICY IF EXISTS "project_branches_update_auth" ON project_branches;

DROP POLICY IF EXISTS "project_branches_delete_auth" ON project_branches;

DROP POLICY IF EXISTS "projects_insert_auth" ON projects;

DROP POLICY IF EXISTS "projects_select_auth" ON projects;

DROP POLICY IF EXISTS "projects_update_auth" ON projects;

DROP POLICY IF EXISTS "projects_delete_auth" ON projects;

REVOKE SELECT, INSERT, UPDATE, DELETE ON project_branches FROM anon_user;
REVOKE SELECT, INSERT, UPDATE, DELETE ON projects FROM anon_user;

ALTER TABLE project_branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

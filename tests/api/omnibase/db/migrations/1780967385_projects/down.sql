

-- RLS policy rollback — 2026-06-09T01:09:47.282Z

DROP POLICY IF EXISTS "projects_insert_auth" ON projects;
DROP POLICY IF EXISTS "projects_select_anon" ON projects;
DROP POLICY IF EXISTS "projects_select_auth" ON projects;
DROP POLICY IF EXISTS "projects_update_auth" ON projects;
DROP POLICY IF EXISTS "projects_delete_auth" ON projects;

ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- DropTable
DROP TABLE "public"."projects";

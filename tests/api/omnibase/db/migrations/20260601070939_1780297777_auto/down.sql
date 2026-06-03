

-- RLS policy rollback — 2026-06-01T07:09:40.591Z

DROP POLICY IF EXISTS "projects_select" ON projects;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- no down.sql generated

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);


-- RLS policies from definePolicy — 2026-06-09T01:09:47.282Z

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_insert_auth" ON projects;
CREATE POLICY "projects_insert_auth" ON projects
  FOR INSERT
  WITH CHECK ((auth.user_id() IS NOT NULL AND projects.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "projects_select_anon" ON projects;
CREATE POLICY "projects_select_anon" ON projects
  FOR SELECT
  USING (projects.published = true);

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

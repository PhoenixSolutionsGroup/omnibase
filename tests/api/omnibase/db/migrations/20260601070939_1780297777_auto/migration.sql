-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);


-- RLS policies from definePolicy — 2026-06-01T07:09:40.591Z

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON projects
  FOR SELECT
  USING (CASE WHEN current_setting('request.jwt.claims', true)::json->>'user_id' IS NULL THEN projects.published = true ELSE projects.tenant_id::text = auth.active_tenant_id() END);

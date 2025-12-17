-- Migration: vps_host_rls
-- Created: 2025-12-10T05:08:52.869Z

-- Enable RLS on vps_hosts table
ALTER TABLE vps_hosts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON vps_hosts TO anon_user;

-- Allow users to read vps_hosts if they have a project that belongs to that VPS host
CREATE POLICY "Users can read vps_hosts for their projects"
ON vps_hosts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.vps_host_id = vps_hosts.id
    AND projects.tenant_id = auth.active_tenant_id()::uuid
  )
);

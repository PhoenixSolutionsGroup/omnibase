-- Migration: usage_metrics
-- Created: 2025-11-05T05:07:20.474Z

-- Usage metrics table (stores time-windowed usage data)
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time window for this metric collection
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Project identifiers
  project_id UUID NOT NULL REFERENCES projects(id),
  project_group_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  
  -- Storage metrics (R2)
  storage_bytes NUMERIC(20,2),
  storage_operations BIGINT,
  
  -- Database metrics (Neon)
  db_storage_gb NUMERIC(12,4),
  db_compute_hours NUMERIC(12,4),
  
  -- Email metrics (Postmark)
  email_sends INTEGER,
  
  -- Cloud Run metrics
  cloudrun_vcpu_hours NUMERIC(12,4),
  cloudrun_memory_gb_hours NUMERIC(12,4),
  cloudrun_billable_time NUMERIC(12,2),
  
  -- Cloudflare Workers metrics
  workers_requests BIGINT,
  workers_cpu_ms BIGINT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no overlapping or duplicate time windows per project
  CONSTRAINT usage_metrics_unique_project_window UNIQUE(project_id, start_time, end_time),
  
  -- Ensure end_time is after start_time
  CONSTRAINT usage_metrics_valid_timeframe CHECK (end_time > start_time)
);

-- Indexes for efficient querying
CREATE INDEX idx_usage_project_time ON usage_metrics(project_id, end_time DESC);
CREATE INDEX idx_usage_project_group_time ON usage_metrics(project_group_id, end_time DESC);
CREATE INDEX idx_usage_org_time ON usage_metrics(organization_id, end_time DESC);
CREATE INDEX idx_usage_start_time ON usage_metrics(start_time);
CREATE INDEX idx_usage_end_time ON usage_metrics(end_time DESC);

-- Function to get the last collection end_time for a project (for gap-free collection)
CREATE OR REPLACE FUNCTION get_last_collection_end_time(p_project_id UUID)
RETURNS TIMESTAMPTZ AS $$
  SELECT end_time 
  FROM usage_metrics 
  WHERE project_id = p_project_id 
  ORDER BY end_time DESC 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;


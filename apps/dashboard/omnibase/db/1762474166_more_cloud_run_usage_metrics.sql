-- Migration: more_cloud_run_usage_metrics
-- Created: 2025-11-07T00:09:26.327Z

-- Add Cloud Run vCPU and memory seconds for accurate cost aggregation
-- Also add request count for usage analytics (requests per billable second)
ALTER TABLE usage_metrics
  ADD COLUMN cloudrun_vcpu_seconds DOUBLE PRECISION DEFAULT 0 NOT NULL,
  ADD COLUMN cloudrun_memory_gb_seconds DOUBLE PRECISION DEFAULT 0 NOT NULL,
  ADD COLUMN cloudrun_requests BIGINT DEFAULT 0 NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN usage_metrics.cloudrun_vcpu_seconds IS 'Total vCPU-seconds consumed (billable_time * vCPU allocation)';
COMMENT ON COLUMN usage_metrics.cloudrun_memory_gb_seconds IS 'Total memory-GB-seconds consumed (billable_time * memory allocation in GB)';
COMMENT ON COLUMN usage_metrics.cloudrun_requests IS 'Total number of requests served by Cloud Run services';

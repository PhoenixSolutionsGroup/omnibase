-- CreateEnum
CREATE TYPE "cluster_status" AS ENUM ('provisioning', 'active', 'maintenance', 'failed', 'deleted');

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('provisioning', 'active', 'suspended', 'failed', 'deleting', 'deleted');

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "key_prefix" VARCHAR(16) NOT NULL,
    "key_hash" VARCHAR(255) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" VARCHAR(255) NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "vultr_id" VARCHAR(255),
    "kubeconfig_encrypted" TEXT,
    "status" "cluster_status" NOT NULL DEFAULT 'provisioning',
    "error_message" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "api_server_url" VARCHAR(512),

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "project_group_id" UUID NOT NULL,
    "branch_name" VARCHAR(255) NOT NULL,
    "is_default_branch" BOOLEAN NOT NULL DEFAULT false,
    "stripe_onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" VARCHAR(255),
    "database_host" VARCHAR(255),
    "database_port" INTEGER,
    "database_name" VARCHAR(255),
    "database_username" VARCHAR(255),
    "database_password_encrypted" TEXT,
    "database_connection_string_encrypted" TEXT,
    "database_anon_key" TEXT,
    "database_service_key_encrypted" TEXT,
    "storage_bucket_name" VARCHAR(255),
    "postmark_server_id" VARCHAR(255),
    "postmark_server_token_encrypted" TEXT,
    "api_url" TEXT,
    "postgrest_url" TEXT,
    "worker_url" TEXT,
    "api_service_key_encrypted" TEXT,
    "status" "project_status" NOT NULL DEFAULT 'provisioning',
    "last_activity_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "suspension_reason" VARCHAR(255),
    "error_message" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storage_access_key" TEXT,
    "storage_secret_key_encrypted" TEXT,
    "storage_endpoint" TEXT,
    "email_deployment_id" VARCHAR(100),
    "workers_deployment_id" VARCHAR(100),
    "deprovisioned_at" TIMESTAMPTZ(6),
    "cluster_id" UUID,
    "namespace" VARCHAR(255),
    "deployment_type" VARCHAR(20) NOT NULL DEFAULT 'shared',

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "project_id" UUID NOT NULL,
    "project_group_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "storage_bytes" DECIMAL(20,2),
    "storage_operations" BIGINT,
    "db_storage_gb" DECIMAL(12,4),
    "db_compute_hours" DECIMAL(12,4),
    "email_sends" INTEGER,
    "cloudrun_billable_time_seconds" DECIMAL(12,2),
    "workers_requests" BIGINT,
    "workers_cpu_ms" BIGINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "cloudrun_vcpu_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cloudrun_memory_gb_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cloudrun_requests" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "account_id" VARCHAR(255) NOT NULL,
    "webhook_id" VARCHAR(255) NOT NULL,
    "callback_url" TEXT NOT NULL,
    "events" TEXT[],
    "connect" BOOLEAN NOT NULL DEFAULT false,
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_key_hash" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "idx_api_keys_prefix" ON "api_keys"("key_prefix");

-- CreateIndex
CREATE INDEX "idx_api_keys_tenant" ON "api_keys"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_clusters_region" ON "clusters"("region");

-- CreateIndex
CREATE INDEX "idx_clusters_status" ON "clusters"("status");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_tenant_id" ON "projects"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_usage_end_time" ON "usage_metrics"("end_time" DESC);

-- CreateIndex
CREATE INDEX "idx_usage_org_time" ON "usage_metrics"("organization_id", "end_time" DESC);

-- CreateIndex
CREATE INDEX "idx_usage_project_group_time" ON "usage_metrics"("project_group_id", "end_time" DESC);

-- CreateIndex
CREATE INDEX "idx_usage_project_time" ON "usage_metrics"("project_id", "end_time" DESC);

-- CreateIndex
CREATE INDEX "idx_usage_start_time" ON "usage_metrics"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "usage_metrics_unique_project_window" ON "usage_metrics"("project_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "idx_webhook_registrations_account" ON "webhook_registrations"("account_id");

-- CreateIndex
CREATE INDEX "idx_webhook_registrations_tenant" ON "webhook_registrations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_webhook_registrations_tenant_webhook" ON "webhook_registrations"("tenant_id", "webhook_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

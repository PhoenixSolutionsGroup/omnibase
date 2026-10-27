-- CreateEnum
CREATE TYPE "project_branch_status" AS ENUM ('provisioning', 'active', 'suspended', 'failed', 'deleting', 'deleted');

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_cluster_id_fkey";

-- DropIndex
DROP INDEX "unique_key_hash";

-- DropIndex
DROP INDEX "idx_projects_status";

-- DropIndex
DROP INDEX "idx_usage_org_time";

-- AlterTable
ALTER TABLE "api_keys" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "key_prefix" SET DATA TYPE TEXT,
ALTER COLUMN "key_hash" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "clusters" ALTER COLUMN "label" SET DATA TYPE TEXT,
ALTER COLUMN "region" SET DATA TYPE TEXT,
ALTER COLUMN "vultr_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "api_server_url" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "api_service_key_encrypted",
DROP COLUMN "api_url",
DROP COLUMN "branch_name",
DROP COLUMN "cluster_id",
DROP COLUMN "database_anon_key",
DROP COLUMN "database_connection_string_encrypted",
DROP COLUMN "database_host",
DROP COLUMN "database_name",
DROP COLUMN "database_password_encrypted",
DROP COLUMN "database_port",
DROP COLUMN "database_service_key_encrypted",
DROP COLUMN "database_username",
DROP COLUMN "deprovisioned_at",
DROP COLUMN "email_deployment_id",
DROP COLUMN "is_default_branch",
DROP COLUMN "last_activity_at",
DROP COLUMN "namespace",
DROP COLUMN "postgrest_url",
DROP COLUMN "postmark_server_id",
DROP COLUMN "postmark_server_token_encrypted",
DROP COLUMN "project_group_id",
DROP COLUMN "status",
DROP COLUMN "storage_access_key",
DROP COLUMN "storage_bucket_name",
DROP COLUMN "storage_endpoint",
DROP COLUMN "storage_secret_key_encrypted",
DROP COLUMN "worker_url",
DROP COLUMN "workers_deployment_id",
ADD COLUMN     "clustersId" UUID,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "stripe_customer_id" SET DATA TYPE TEXT,
ALTER COLUMN "suspension_reason" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "deployment_type" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "usage_metrics" DROP COLUMN "cloudrun_billable_time_seconds",
DROP COLUMN "cloudrun_memory_gb_seconds",
DROP COLUMN "cloudrun_requests",
DROP COLUMN "cloudrun_vcpu_seconds",
DROP COLUMN "organization_id",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "webhook_registrations" ALTER COLUMN "account_id" SET DATA TYPE TEXT,
ALTER COLUMN "webhook_id" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "project_status";

-- CreateTable
CREATE TABLE "project_branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "database_host" TEXT,
    "database_port" INTEGER,
    "database_name" TEXT,
    "database_username" TEXT,
    "database_password_encrypted" TEXT,
    "database_connection_string_encrypted" TEXT,
    "database_anon_key" TEXT,
    "database_service_key_encrypted" TEXT,
    "storage_bucket_name" TEXT,
    "postmark_server_id" TEXT,
    "postmark_server_token_encrypted" TEXT,
    "api_url" TEXT,
    "postgrest_url" TEXT,
    "worker_url" TEXT,
    "api_service_key_encrypted" TEXT,
    "status" "project_branch_status" NOT NULL DEFAULT 'provisioning',
    "suspension_reason" TEXT,
    "error_message" TEXT,
    "storage_access_key" TEXT,
    "storage_secret_key_encrypted" TEXT,
    "storage_endpoint" TEXT,
    "email_deployment_id" TEXT,
    "workers_deployment_id" TEXT,
    "deprovisioned_at" TIMESTAMPTZ(6),
    "cluster_id" UUID,
    "namespace" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_branches_status_idx" ON "project_branches"("status");

-- CreateIndex
CREATE INDEX "usage_metrics_tenant_id_end_time_idx" ON "usage_metrics"("tenant_id", "end_time" DESC);

-- AddForeignKey
ALTER TABLE "project_branches" ADD CONSTRAINT "project_branches_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "idx_usage_end_time" RENAME TO "usage_metrics_end_time_idx";

-- RenameIndex
ALTER INDEX "idx_usage_project_group_time" RENAME TO "usage_metrics_project_group_id_end_time_idx";

-- RenameIndex
ALTER INDEX "idx_usage_project_time" RENAME TO "usage_metrics_project_id_end_time_idx";

-- RenameIndex
ALTER INDEX "idx_usage_start_time" RENAME TO "usage_metrics_start_time_idx";

-- RenameIndex
ALTER INDEX "usage_metrics_unique_project_window" RENAME TO "usage_metrics_project_id_start_time_end_time_key";

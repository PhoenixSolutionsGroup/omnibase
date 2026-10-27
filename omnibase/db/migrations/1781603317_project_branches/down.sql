-- CreateEnum
CREATE TYPE "public"."project_status" AS ENUM ('provisioning', 'active', 'suspended', 'failed', 'deleting', 'deleted');

-- DropForeignKey
ALTER TABLE "public"."project_branches" DROP CONSTRAINT "project_branches_cluster_id_fkey";

-- DropIndex
DROP INDEX "public"."usage_metrics_tenant_id_end_time_idx";

-- AlterTable
ALTER TABLE "public"."api_keys" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "key_prefix" SET DATA TYPE VARCHAR(16),
ALTER COLUMN "key_hash" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."clusters" ALTER COLUMN "label" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "region" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "vultr_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "api_server_url" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "clustersId",
ADD COLUMN     "api_service_key_encrypted" TEXT,
ADD COLUMN     "api_url" TEXT,
ADD COLUMN     "branch_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "cluster_id" UUID,
ADD COLUMN     "database_anon_key" TEXT,
ADD COLUMN     "database_connection_string_encrypted" TEXT,
ADD COLUMN     "database_host" VARCHAR(255),
ADD COLUMN     "database_name" VARCHAR(255),
ADD COLUMN     "database_password_encrypted" TEXT,
ADD COLUMN     "database_port" INTEGER,
ADD COLUMN     "database_service_key_encrypted" TEXT,
ADD COLUMN     "database_username" VARCHAR(255),
ADD COLUMN     "deprovisioned_at" TIMESTAMPTZ(6),
ADD COLUMN     "email_deployment_id" VARCHAR(100),
ADD COLUMN     "is_default_branch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_activity_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "namespace" VARCHAR(255),
ADD COLUMN     "postgrest_url" TEXT,
ADD COLUMN     "postmark_server_id" VARCHAR(255),
ADD COLUMN     "postmark_server_token_encrypted" TEXT,
ADD COLUMN     "project_group_id" UUID NOT NULL,
ADD COLUMN     "status" "public"."project_status" NOT NULL DEFAULT 'provisioning',
ADD COLUMN     "storage_access_key" TEXT,
ADD COLUMN     "storage_bucket_name" VARCHAR(255),
ADD COLUMN     "storage_endpoint" TEXT,
ADD COLUMN     "storage_secret_key_encrypted" TEXT,
ADD COLUMN     "worker_url" TEXT,
ADD COLUMN     "workers_deployment_id" VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "stripe_customer_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "suspension_reason" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "deployment_type" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "public"."usage_metrics" DROP COLUMN "tenant_id",
ADD COLUMN     "cloudrun_billable_time_seconds" DECIMAL(12,2),
ADD COLUMN     "cloudrun_memory_gb_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cloudrun_requests" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "cloudrun_vcpu_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "organization_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."webhook_registrations" ALTER COLUMN "account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "webhook_id" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "public"."project_branches";

-- DropEnum
DROP TYPE "public"."project_branch_status";

-- CreateIndex
CREATE UNIQUE INDEX "unique_key_hash" ON "public"."api_keys"("key_hash" ASC);

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "public"."projects"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_usage_org_time" ON "public"."usage_metrics"("organization_id" ASC, "end_time" DESC);

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "public"."usage_metrics_end_time_idx" RENAME TO "idx_usage_end_time";

-- RenameIndex
ALTER INDEX "public"."usage_metrics_project_group_id_end_time_idx" RENAME TO "idx_usage_project_group_time";

-- RenameIndex
ALTER INDEX "public"."usage_metrics_project_id_end_time_idx" RENAME TO "idx_usage_project_time";

-- RenameIndex
ALTER INDEX "public"."usage_metrics_start_time_idx" RENAME TO "idx_usage_start_time";

-- RenameIndex
ALTER INDEX "public"."usage_metrics_project_id_start_time_end_time_key" RENAME TO "usage_metrics_unique_project_window";

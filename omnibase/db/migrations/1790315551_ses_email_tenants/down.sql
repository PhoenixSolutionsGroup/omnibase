-- AlterTable
ALTER TABLE "public"."project_branches" DROP COLUMN "ses_config_set",
DROP COLUMN "ses_tenant_id",
DROP COLUMN "ses_tenant_name",
ADD COLUMN     "postmark_server_id" TEXT,
ADD COLUMN     "postmark_server_token_encrypted" TEXT;

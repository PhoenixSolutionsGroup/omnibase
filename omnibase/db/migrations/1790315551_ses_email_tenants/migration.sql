-- AlterTable
ALTER TABLE "project_branches" DROP COLUMN "postmark_server_id",
DROP COLUMN "postmark_server_token_encrypted",
ADD COLUMN     "ses_config_set" TEXT,
ADD COLUMN     "ses_tenant_id" TEXT,
ADD COLUMN     "ses_tenant_name" TEXT;

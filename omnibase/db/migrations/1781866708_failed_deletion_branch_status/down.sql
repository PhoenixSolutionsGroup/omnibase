-- AlterEnum
BEGIN;
CREATE TYPE "public"."project_branch_status_new" AS ENUM ('provisioning', 'active', 'suspended', 'failed', 'deleting', 'deleted');
ALTER TABLE "project_branches" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."project_branches" ALTER COLUMN "status" TYPE "public"."project_branch_status_new" USING ("status"::text::"public"."project_branch_status_new");
ALTER TYPE "public"."project_branch_status" RENAME TO "project_branch_status_old";
ALTER TYPE "public"."project_branch_status_new" RENAME TO "project_branch_status";
DROP TYPE "project_branch_status_old";
ALTER TABLE "public"."project_branches" ALTER COLUMN "status" SET DEFAULT 'provisioning';
COMMIT;

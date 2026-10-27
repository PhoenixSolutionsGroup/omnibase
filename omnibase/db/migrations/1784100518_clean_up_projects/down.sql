-- DropForeignKey
ALTER TABLE "public"."branch_workers" DROP CONSTRAINT "branch_workers_project_branch_id_fkey";

-- AlterTable
ALTER TABLE "public"."project_branches" ADD COLUMN     "worker_url" TEXT,
ADD COLUMN     "workers_deployment_id" TEXT;

-- DropTable
DROP TABLE "public"."branch_workers";

-- DropForeignKey
ALTER TABLE "public"."branch_worker_domains" DROP CONSTRAINT "branch_worker_domains_branch_worker_id_fkey";

-- DropTable
DROP TABLE "public"."branch_worker_domains";

-- DropForeignKey
ALTER TABLE "public"."project_branches" DROP CONSTRAINT "project_branches_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."project_branches" DROP CONSTRAINT "project_branches_cluster_id_fkey";

-- AlterTable
ALTER TABLE "public"."project_branches" DROP COLUMN "project_id";

-- AddForeignKey
ALTER TABLE "public"."project_branches" ADD CONSTRAINT "project_branches_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- DropForeignKey
ALTER TABLE "project_branches" DROP CONSTRAINT "project_branches_cluster_id_fkey";

-- AlterTable
ALTER TABLE "project_branches" ADD COLUMN     "project_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "project_branches" ADD CONSTRAINT "project_branches_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_branches" ADD CONSTRAINT "project_branches_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

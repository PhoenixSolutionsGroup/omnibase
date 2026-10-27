-- AlterTable
ALTER TABLE "project_branches" DROP COLUMN "worker_url",
DROP COLUMN "workers_deployment_id";

-- CreateTable
CREATE TABLE "branch_workers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "worker_url" TEXT,
    "worker_deployment_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_workers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branch_workers_project_branch_id_idx" ON "branch_workers"("project_branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_workers_project_branch_id_name_key" ON "branch_workers"("project_branch_id", "name");

-- AddForeignKey
ALTER TABLE "branch_workers" ADD CONSTRAINT "branch_workers_project_branch_id_fkey" FOREIGN KEY ("project_branch_id") REFERENCES "project_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

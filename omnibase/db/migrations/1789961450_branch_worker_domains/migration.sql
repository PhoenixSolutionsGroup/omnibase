-- CreateTable
CREATE TABLE "branch_worker_domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_worker_id" UUID NOT NULL,
    "hostname" TEXT NOT NULL,
    "cf_custom_hostname_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ssl_status" TEXT,
    "dcv_record_name" TEXT,
    "dcv_record_value" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_worker_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branch_worker_domains_hostname_key" ON "branch_worker_domains"("hostname");

-- CreateIndex
CREATE INDEX "branch_worker_domains_branch_worker_id_idx" ON "branch_worker_domains"("branch_worker_id");

-- AddForeignKey
ALTER TABLE "branch_worker_domains" ADD CONSTRAINT "branch_worker_domains_branch_worker_id_fkey" FOREIGN KEY ("branch_worker_id") REFERENCES "branch_workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

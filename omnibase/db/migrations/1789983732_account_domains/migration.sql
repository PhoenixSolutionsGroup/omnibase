-- AlterTable
ALTER TABLE "branch_worker_domains" DROP COLUMN "cf_custom_hostname_id",
DROP COLUMN "dcv_record_name",
DROP COLUMN "dcv_record_value",
DROP COLUMN "ssl_status",
ADD COLUMN     "account_domain_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "account_domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hostname" TEXT NOT NULL,
    "is_wildcard" BOOLEAN NOT NULL DEFAULT false,
    "cf_custom_hostname_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ssl_status" TEXT,
    "dcv_record_name" TEXT,
    "dcv_record_value" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_domains_hostname_key" ON "account_domains"("hostname");

-- CreateIndex
CREATE INDEX "idx_account_domains_tenant" ON "account_domains"("tenant_id");

-- CreateIndex
CREATE INDEX "branch_worker_domains_account_domain_id_idx" ON "branch_worker_domains"("account_domain_id");

-- AddForeignKey
ALTER TABLE "branch_worker_domains" ADD CONSTRAINT "branch_worker_domains_account_domain_id_fkey" FOREIGN KEY ("account_domain_id") REFERENCES "account_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS policies
ALTER TABLE account_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "account_domains_insert_auth" ON account_domains;
CREATE POLICY "account_domains_insert_auth" ON account_domains
  FOR INSERT
  WITH CHECK ((auth.user_id() IS NOT NULL AND account_domains.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "account_domains_select_auth" ON account_domains;
CREATE POLICY "account_domains_select_auth" ON account_domains
  FOR SELECT
  USING ((auth.user_id() IS NOT NULL AND account_domains.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "account_domains_update_auth" ON account_domains;
CREATE POLICY "account_domains_update_auth" ON account_domains
  FOR UPDATE
  USING ((auth.user_id() IS NOT NULL AND account_domains.tenant_id::text = auth.active_tenant_id()))
  WITH CHECK ((auth.user_id() IS NOT NULL AND account_domains.tenant_id::text = auth.active_tenant_id()));

DROP POLICY IF EXISTS "account_domains_delete_auth" ON account_domains;
CREATE POLICY "account_domains_delete_auth" ON account_domains
  FOR DELETE
  USING (auth.user_id() IS NOT NULL);

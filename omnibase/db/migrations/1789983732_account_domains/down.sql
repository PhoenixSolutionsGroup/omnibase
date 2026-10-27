
DROP POLICY IF EXISTS "account_domains_insert_auth" ON account_domains;

DROP POLICY IF EXISTS "account_domains_select_auth" ON account_domains;

DROP POLICY IF EXISTS "account_domains_update_auth" ON account_domains;

DROP POLICY IF EXISTS "account_domains_delete_auth" ON account_domains;

ALTER TABLE account_domains DISABLE ROW LEVEL SECURITY;
-- DropForeignKey
ALTER TABLE "public"."branch_worker_domains" DROP CONSTRAINT "branch_worker_domains_account_domain_id_fkey";

-- DropIndex
DROP INDEX "public"."branch_worker_domains_account_domain_id_idx";

-- AlterTable
ALTER TABLE "public"."branch_worker_domains" DROP COLUMN "account_domain_id",
ADD COLUMN     "cf_custom_hostname_id" TEXT,
ADD COLUMN     "dcv_record_name" TEXT,
ADD COLUMN     "dcv_record_value" TEXT,
ADD COLUMN     "ssl_status" TEXT;

-- DropTable
DROP TABLE "public"."account_domains";

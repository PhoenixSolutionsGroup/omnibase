-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "tenant_id",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "idx_api_keys_tenant" ON "api_keys"("tenant_id");

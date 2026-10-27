-- AlterTable
ALTER TABLE "public"."clusters" DROP COLUMN "provider";

-- DropEnum
DROP TYPE "public"."cluster_provider";

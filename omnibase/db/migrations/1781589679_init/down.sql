-- DropForeignKey
ALTER TABLE "public"."projects" DROP CONSTRAINT "projects_cluster_id_fkey";

-- DropTable
DROP TABLE "public"."api_keys";

-- DropTable
DROP TABLE "public"."clusters";

-- DropTable
DROP TABLE "public"."projects";

-- DropTable
DROP TABLE "public"."usage_metrics";

-- DropTable
DROP TABLE "public"."webhook_registrations";

-- DropEnum
DROP TYPE "public"."cluster_status";

-- DropEnum
DROP TYPE "public"."project_status";

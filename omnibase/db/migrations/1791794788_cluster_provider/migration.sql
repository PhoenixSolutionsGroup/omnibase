-- CreateEnum
CREATE TYPE "cluster_provider" AS ENUM ('vks', 'ovh');

-- AlterTable
ALTER TABLE "clusters" ADD COLUMN     "provider" "cluster_provider" NOT NULL DEFAULT 'vks';

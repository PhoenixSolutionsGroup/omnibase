-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_onboarding_complete" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "clusters" ADD COLUMN "kubeconfig_encrypted" TEXT,
ADD COLUMN "api_server_url" TEXT;

DROP INDEX "clusters_label_key";
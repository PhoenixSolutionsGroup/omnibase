-- Migration: cluster_identity_to_argocd

-- Cluster identity/connection now lives in ArgoCD. Drop the duplicated
-- connection columns; keep only the lifecycle state keyed by a stable
-- per-region label.
ALTER TABLE "clusters" DROP COLUMN "kubeconfig_encrypted",
DROP COLUMN "api_server_url";

CREATE UNIQUE INDEX "clusters_label_key" ON "clusters"("label");

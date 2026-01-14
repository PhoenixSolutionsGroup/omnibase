import type { Metadata } from "next";
import { protectedRoute } from "@omnibase/nextjs/auth";
import { UnifiedLayoutClient } from "@/components/layout-client";
import { getOmnibaseConfiguration } from "@/lib/server";
import { V1AuthApi } from "@omnibase/core-js";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

export default async function ProjectLayout({ children }: { children: any }) {
  await protectedRoute("/auth/login");

  const config = await getOmnibaseConfiguration();
  const authApi = new V1AuthApi(config);

  const response = await authApi.listTenants();
  const tenantItems = response.data?.tenants ?? [];

  if (tenantItems.length === 0) {
    return redirect("/auth/onboarding");
  }

  const activeTenantItem = tenantItems.find((t) => t.isActive);
  if (!activeTenantItem) {
    return redirect("/auth/onboarding");
  }

  const tenants = tenantItems.map((t) => t.tenant);
  const currentTenantId = activeTenantItem.tenant.id;

  return (
    <UnifiedLayoutClient tenants={tenants} currentTenantId={currentTenantId}>
      {children}
    </UnifiedLayoutClient>
  );
}

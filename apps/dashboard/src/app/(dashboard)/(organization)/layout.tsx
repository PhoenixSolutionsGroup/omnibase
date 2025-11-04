import type { Metadata } from "next";
import { protectedRoute } from "@omnibase/nextjs/auth";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { createServerClient } from "@/lib/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

export default async function ProjectLayout({ children }: { children: any }) {
  await protectedRoute("/auth/login");

  const db = (await createServerClient()) as any;
  const { data: organization } = await db
    .schema("auth")
    .from("tenant_users")
    .select("tenants(*)")
    .eq("is_active", true)
    .single();

  if (!organization) {
    return redirect("/auth/onboarding");
  }

  const tenantName = organization.tenants.name;

  return (
    <DashboardLayoutClient tenantName={tenantName}>
      {children}
    </DashboardLayoutClient>
  );
}

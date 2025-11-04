import type { Metadata } from "next";
import { protectedRoute } from "@omnibase/nextjs/auth";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

export default async function ProjectGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await protectedRoute("/auth/login");

  return <>{children}</>;
}

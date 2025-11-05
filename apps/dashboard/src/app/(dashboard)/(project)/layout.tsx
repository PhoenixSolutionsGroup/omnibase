import type { Metadata } from "next";
import { protectedRoute } from "@omnibase/nextjs/auth";
import { getProject } from "@/utils/get-project";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default async function ProjectGroupLayout({
  children,
}: ProjectLayoutProps) {
  await protectedRoute("/auth/login");

  return <>{children}</>;
}

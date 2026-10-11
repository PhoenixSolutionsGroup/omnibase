import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import { protectedRoute } from "@omnibase/nextjs/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await protectedRoute("/auth/login");
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <AppHeader />
        <main className="p-6 h-full full">{children}</main>
      </div>
    </SidebarProvider>
  );
}

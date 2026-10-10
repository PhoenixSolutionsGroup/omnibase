import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
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

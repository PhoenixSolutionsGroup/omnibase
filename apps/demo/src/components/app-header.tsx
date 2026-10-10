import { SidebarTrigger } from "./ui/sidebar";

export default function AppHeader() {
  const title = "Dashboard";
  return (
    <div className="min-h-12 flex items-center p-4 gap-2 border-b">
      <SidebarTrigger />
      {title}
    </div>
  );
}

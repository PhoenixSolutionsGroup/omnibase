"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BuildingComplex,
  CalendarDays,
  ClipboardList,
  HandCoins,
  Layout,
  LogOut,
  UserGroup,
} from "lucide-react";

export function AppSidebar() {
  const isOwner = true; // get that from omnibase user role

  const doLogout = () => {};
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/dashboard" className="flex items-center gap-2">
                <CalendarDays className="size-5!" />
                <span className="text-base font-semibold">Shiftly</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href="/dashboard" />}>
                <Layout />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href="/workplaces" />}>
                <BuildingComplex />
                Workplaces
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href="/schedules" />}>
                <ClipboardList />
                Schedules
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href="/users" />}>
                <UserGroup />
                Users
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isOwner && (
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="/payments" />}>
                  <HandCoins />
                  Payments
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={doLogout}>
            <LogOut />
            Logout
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}

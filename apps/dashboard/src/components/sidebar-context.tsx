"use client";

import * as React from "react";

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsedState(stored === "true");
    }
    setHydrated(true);
  }, []);

  const setIsCollapsed = React.useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, []);

  const toggle = React.useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  const value = React.useMemo(
    () => ({ isCollapsed: hydrated ? isCollapsed : false, setIsCollapsed, toggle }),
    [isCollapsed, setIsCollapsed, toggle, hydrated]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

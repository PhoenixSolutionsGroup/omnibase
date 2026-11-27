"use client";

import * as React from "react";
import { SIDEBAR_COOKIE } from "@/lib/sidebar-constant";

interface SidebarContextValue {
	isCollapsed: boolean;
	setIsCollapsed: (collapsed: boolean) => void;
	toggle: () => void;
}

interface SidebarProviderProps {
	children: React.ReactNode;
	defaultCollapsed?: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
	children,
	defaultCollapsed = false,
}: SidebarProviderProps) {
	const [isCollapsed, setIsCollapsedState] =
		React.useState<boolean>(defaultCollapsed);

	const setIsCollapsed = React.useCallback((collapsed: boolean): void => {
		setIsCollapsedState(collapsed);
		document.cookie = `${SIDEBAR_COOKIE}=${collapsed}; path=/; max-age=31536000; samesite=lax`;
	}, []);

	const toggle = React.useCallback((): void => {
		setIsCollapsed(!isCollapsed);
	}, [isCollapsed, setIsCollapsed]);

	const value = React.useMemo<SidebarContextValue>(
		() => ({ isCollapsed, setIsCollapsed, toggle }),
		[isCollapsed, setIsCollapsed, toggle],
	);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
}

export function useSidebar(): SidebarContextValue {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}

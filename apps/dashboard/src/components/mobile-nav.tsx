"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { BranchDropdown } from "./branch-dropdown";
import { ProjectDropdown, type ProjectOption } from "./project-dropdown";
import {
	getProjectNavigationItems,
	organizationNavigationItems,
} from "./sidebar";

export interface MobileProjectContext {
	branchId: string;
	projectId: string;
	projectBranch: string;
	projectName: string;
	branches: string[];
	projects?: ProjectOption[];
	onCreateProject?: () => void;
}

interface FullscreenOverlayProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

// z-40 on purpose: Radix Select portals its list at z-50, so the
// project/branch selects stay clickable above this overlay.
function FullscreenOverlay({
	open,
	onClose,
	title,
	children,
}: FullscreenOverlayProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-40 flex flex-col bg-background md:hidden">
			<div className="flex h-18 shrink-0 items-center justify-between border-b border-border px-4">
				<span className="text-sm font-semibold">{title}</span>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
			<div className="flex-1 overflow-y-auto p-4">{children}</div>
		</div>
	);
}

interface NavLinkListProps {
	items: {
		title: string;
		href: string;
		icon: React.ComponentType<{ className?: string }>;
	}[];
	pathname: string;
	onNavigate: () => void;
}

function NavLinkList({ items, pathname, onNavigate }: NavLinkListProps) {
	return (
		<nav className="space-y-1">
			{items.map(({ title, href, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					onClick={onNavigate}
					className={cn(
						"flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
						pathname === href
							? "bg-accent text-accent-foreground"
							: "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
					)}
				>
					<Icon className="h-4 w-4 shrink-0" />
					{title}
				</Link>
			))}
		</nav>
	);
}

interface MobileMenuOverlayProps {
	open: boolean;
	onClose: () => void;
	projectContext?: MobileProjectContext;
}

export function MobileMenuOverlay({
	open,
	onClose,
	projectContext,
}: MobileMenuOverlayProps) {
	const pathname = usePathname();
	const projectItems = projectContext
		? getProjectNavigationItems(
				projectContext.projectId,
				projectContext.projectBranch,
			)
		: [];

	return (
		<FullscreenOverlay open={open} onClose={onClose} title="Menu">
			<div className="space-y-6">
				{projectContext && (
					<section className="space-y-2">
						<p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{projectContext.projectName}
						</p>
						<NavLinkList
							items={projectItems}
							pathname={pathname}
							onNavigate={onClose}
						/>
					</section>
				)}
				<section className="space-y-2">
					<p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Organization
					</p>
					<NavLinkList
						items={organizationNavigationItems}
						pathname={pathname}
						onNavigate={onClose}
					/>
				</section>
			</div>
		</FullscreenOverlay>
	);
}

interface MobileProjectOverlayProps {
	open: boolean;
	onClose: () => void;
	projectContext: MobileProjectContext;
}

export function MobileProjectOverlay({
	open,
	onClose,
	projectContext,
}: MobileProjectOverlayProps) {
	return (
		<FullscreenOverlay open={open} onClose={onClose} title="Project & branch">
			<div className="space-y-6">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Project
					</p>
					<div className="rounded-md border border-border">
						<ProjectDropdown
							projectId={projectContext.projectId}
							currentProject={projectContext.projectName}
							currentBranch={projectContext.projectBranch}
							projects={projectContext.projects}
							onCreateProject={projectContext.onCreateProject}
						/>
					</div>
				</div>
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Branch
					</p>
					<div className="rounded-md border border-border">
						<BranchDropdown
							currentBranch={projectContext.projectBranch}
							branches={projectContext.branches}
							projectId={projectContext.projectId}
						/>
					</div>
				</div>
			</div>
		</FullscreenOverlay>
	);
}

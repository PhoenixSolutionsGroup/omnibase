"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Database } from "@/types/omnibase";

const MESSAGES = [
	"fetching some super important data...",
	"doing some magic in the backend...",
	"making up some cool unique url for you...",
	"making sure postgres knows its place...",
	"preparing a slick project for you...",
	"provisioning some very sophisticated setup...",
];

const VISIBLE_MS = 2200;
const FADE_MS = 500;

function RotatingText() {
	const [index, setIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
		return () => clearTimeout(hideTimer);
	}, [index]);

	useEffect(() => {
		if (visible) return;
		const swapTimer = setTimeout(() => {
			setIndex((i) => (i + 1) % MESSAGES.length);
			setVisible(true);
		}, FADE_MS);
		return () => clearTimeout(swapTimer);
	}, [visible]);

	return (
		<p
			className="text-sm text-muted-foreground transition-opacity ease-in-out"
			style={{
				opacity: visible ? 1 : 0,
				transitionDuration: `${FADE_MS}ms`,
			}}
			aria-live="polite"
		>
			{MESSAGES[index]}
		</p>
	);
}

export type Project = Omit<
	Database["public"]["Tables"]["project_branches"]["Row"],
	"name"
> & {
	branch_name: string;
	name: string;
	tenant_id: string;
	api_url: string | null;
	postgrest_url: string | null;
	database_host: string | null;
	database_pooler_host: string | null;
};

interface ProjectProvisioningDashboardProps {
	project: Project;
}

export function ProjectProvisioningDashboard({
	project,
}: ProjectProvisioningDashboardProps) {
	useEffect(() => {
		const checkStripeOnboarding = async () => {
			if (!project.stripe_account_id) {
				return;
			}
			try {
				const returnTo = encodeURIComponent(window.location.href);
				const response = await fetch(
					`/api/project_branches/${project.id}/stripe-onboarding?return_to=${returnTo}`,
				);
				const data = await response.json();

				if (data.onboarding_required && data.url) {
					window.location.href = data.url;
				}
			} catch (error) {
				console.error("Failed to check Stripe onboarding:", error);
			}
		};

		checkStripeOnboarding();
	}, [project.id, project.stripe_account_id]);

	return (
		<div className="flex h-full flex-col items-center justify-center p-6">
			<div className="mx-auto w-full max-w-2xl space-y-6 text-center">
				<div className="flex justify-center relative">
					<Image
						src="/omnibase-logo-loading.svg"
						alt="Omnibase"
						width={64}
						height={64}
						className="shrink-0 rounded-lg absolute -mt-12 animate-bounce"
						unoptimized
					/>
				</div>

				<div className="space-y-2">
					<h1 className="text-xl font-bold tracking-tight">
						Provisioning Project
					</h1>
					<div className="flex h-5 items-center justify-center">
						<RotatingText />
					</div>
				</div>
			</div>
		</div>
	);
}

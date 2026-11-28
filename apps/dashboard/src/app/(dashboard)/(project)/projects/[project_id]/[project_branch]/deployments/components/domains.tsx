"use client";

import { Loader2, Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface DomainProps {
	projectId: string;
	workerName: string;
}

interface AccountDomain {
	id: string;
	hostname: string;
	is_wildcard: boolean;
	status: string;
}

interface AttachedDomain {
	id: string;
	hostname: string;
	account_domain_id: string;
	status: string;
}

interface ProjectState {
	pulse?: boolean;
	color: string;
	label: string;
}

const DOMAIN_STATES = {
	active: {
		color: "bg-success/10 border-success text-success",
		label: "active",
	},
	pending: {
		color: "bg-warning/10 border-warning text-warning",
		label: "pending",
	},
} as const satisfies Record<string, ProjectState>;

function getDomainState(status: string): ProjectState {
	if (status === "active" || status === "pending") {
		return DOMAIN_STATES[status];
	}
	return DOMAIN_STATES.pending;
}

export default function Domains({ projectId, workerName }: DomainProps) {
	const [loading, setLoading] = useState(true);
	const [domains, setDomains] = useState<AccountDomain[]>([]);
	const [attachedDomains, setAttachedDomains] = useState<AttachedDomain[]>([]);
	const [selectedDomainId, setSelectedDomainId] = useState<string>("");
	const [subdomain, setSubdomain] = useState<string>("");
	const [attaching, setAttaching] = useState(false);

	const loadDomains = useCallback(async () => {
		try {
			const res = await fetch("/api/domains");
			if (res.ok) {
				const data = await res.json();
				setDomains(data.filter((d: AccountDomain) => d.status === "active"));
			}
		} catch (error) {
			console.error("Failed to load domains:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadAttached = useCallback(async () => {
		try {
			const res = await fetch(
				`/api/project_branches/${projectId}/workers/${workerName}/domains`,
			);
			if (res.ok) {
				setAttachedDomains(await res.json());
			}
		} catch (error) {
			console.error("Failed to load attached domains:", error);
		}
	}, [projectId, workerName]);

	useEffect(() => {
		loadDomains();
	}, [loadDomains]);

	useEffect(() => {
		loadAttached();
	}, [loadAttached]);

	const attachedAccountIds = new Set(
		attachedDomains.map((d) => d.account_domain_id),
	);
	const availableDomains = domains.filter(
		(d) => d.is_wildcard || !attachedAccountIds.has(d.id),
	);

	const selectedDomain = domains.find((d) => d.id === selectedDomainId);

	const handleAttach = async () => {
		if (!selectedDomain) return;

		let target = selectedDomain.hostname;
		if (selectedDomain.is_wildcard) {
			const sub = subdomain.trim();
			if (!sub) {
				toast.error("Enter the subdomain to attach");
				return;
			}
			target = sub.toLowerCase();
		}

		setAttaching(true);
		try {
			const res = await fetch(
				`/api/project_branches/${projectId}/workers/${workerName}/domains`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						account_domain_id: selectedDomain.id,
						hostname: target,
					}),
				},
			);
			const data = await res.json();
			if (!res.ok) {
				toast.error(data?.error || data?.message || "Failed to attach domain");
				return;
			}
			toast.success(`${target} attached to ${workerName}`);
			setSelectedDomainId("");
			setSubdomain("");
			loadAttached();
		} catch (_error) {
			toast.error("Failed to attach domain");
		} finally {
			setAttaching(false);
		}
	};

	const handleDetach = async (domainId: string, hostname: string) => {
		try {
			const res = await fetch(
				`{process.env.NEXT_PUBLIC_API_URL}/api/v1/project_branches/${projectId}/worker-domains/${domainId}`,
				{ credentials: "include", method: "DELETE" },
			);
			if (res.ok) {
				toast.success(`${hostname} detached from ${workerName}`);
				loadAttached();
			} else {
				toast.error("Failed to detach domain");
			}
		} catch (_error) {
			toast.error("Failed to detach domain");
		}
	};

	return (
		<Card className="pt-0 gap-0">
			<CardHeader className="flex items-center gap-2 pt-5 pb-4 sm:flex-row">
				<div className="grid flex-1">
					<CardTitle>Domains</CardTitle>
					<CardDescription>
						Custom domains routed to{" "}
						<span className="font-bold">{workerName}</span>.
					</CardDescription>
				</div>
			</CardHeader>
			<Separator />
			<CardContent className="p-0! space-y-4">
				{/* Attached domains */}
				<div>
					{attachedDomains.length === 0 ? (
						<div className="border-b px-4 py-6 text-center text-sm text-muted-foreground">
							No domains attached yet.
						</div>
					) : (
						attachedDomains.map((domain) => (
							<div
								key={domain.id}
								className="border-b flex justify-between items-center py-2 px-4"
							>
								<span>{domain.hostname}</span>
								<div className="flex items-center">
									<span>
										<StatusBadge
											{...getDomainState(domain.status)}
											variant="fill"
										/>
									</span>
									<Button
										variant="ghost"
										aria-label={`Detach ${domain.hostname}`}
										onClick={() => handleDetach(domain.id, domain.hostname)}
									>
										<Trash />
									</Button>
								</div>
							</div>
						))
					)}
				</div>

				{/* Attach a new domain */}
				<div className="flex-col flex gap-2 px-4 pb-4">
					<Select
						value={selectedDomainId}
						onValueChange={setSelectedDomainId}
						disabled={loading || availableDomains.length === 0}
					>
						<SelectTrigger className="w-full">
							<SelectValue
								placeholder={
									loading
										? "Loading domains..."
										: availableDomains.length === 0
											? "No domains available"
											: "Select domain"
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{availableDomains.map((domain) => (
								<SelectItem key={domain.id} value={domain.id}>
									{domain.hostname}
									{domain.is_wildcard ? " (wildcard)" : ""}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{selectedDomain?.is_wildcard && (
						<Input
							aria-label="Subdomain"
							value={subdomain}
							onChange={(e) => setSubdomain(e.target.value)}
							placeholder={`app.${selectedDomain.hostname.replace("*.", "")}`}
						/>
					)}
					<Button
						className="w-full"
						disabled={!selectedDomainId || attaching}
						onClick={handleAttach}
					>
						{attaching ? <Loader2 className="animate-spin" /> : <Plus />}
						Attach Domain
					</Button>
					<span className="text-muted-foreground text-xs">
						Only verified account domains appear here. Add new ones in
						Organization settings.
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

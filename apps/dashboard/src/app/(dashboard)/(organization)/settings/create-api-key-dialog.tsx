"use client";

import type { NamespaceDefinitionResponse } from "@omnibase/core-js";
import { PermissionsSelectorTree } from "@omnibase/shadcn";
import { Check, Copy, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAPIKey, type Permission } from "./actions";

interface NamespaceMapEntry {
	id: string;
	label: string;
}

interface CreateAPIKeyDialogProps {
	definitions: NamespaceDefinitionResponse[];
	namespaceMap: Record<string, NamespaceMapEntry[]>;
	onCreated?: () => void | Promise<void>;
}

function parsePermissionString(perm: string): {
	namespace: string;
	relation: string;
	objectId: string;
} {
	const hashIndex = perm.indexOf("#");
	if (hashIndex === -1) return { namespace: "", relation: "", objectId: "" };

	const beforeHash = perm.substring(0, hashIndex);
	const relation = perm.substring(hashIndex + 1);
	const colonIndex = beforeHash.indexOf(":");

	if (colonIndex === -1)
		return { namespace: beforeHash, relation, objectId: "" };
	return {
		namespace: beforeHash.substring(0, colonIndex),
		relation,
		objectId: beforeHash.substring(colonIndex + 1),
	};
}

export function CreateAPIKeyDialog({
	definitions,
	namespaceMap,
	onCreated,
}: CreateAPIKeyDialogProps) {
	const [open, setOpen] = useState(false);
	const [keyName, setKeyName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [isCopied, setIsCopied] = useState(false);

	// The tree looks up objects by lower-cased namespace key.
	const lowerNamespaceMap = useMemo(() => {
		const out: Record<string, NamespaceMapEntry[]> = {};
		for (const [key, value] of Object.entries(namespaceMap)) {
			out[key.toLowerCase()] = value;
		}
		return out;
	}, [namespaceMap]);

	// Restore original namespace casing (tree emits lower-cased) so the API's
	// case-sensitive namespace matching works.
	const originalNamespace = useMemo(() => {
		const map = new Map<string, string>();
		for (const d of definitions)
			map.set(d.namespace.toLowerCase(), d.namespace);
		return map;
	}, [definitions]);

	const buildPermissions = (): Permission[] => {
		return selectedPermissions
			.map((perm) => parsePermissionString(perm))
			.filter((p) => p.namespace && p.relation)
			.map((p) => {
				const namespace = originalNamespace.get(p.namespace) ?? p.namespace;
				const permission: Permission = { namespace, relation: p.relation };
				if (namespace.toLowerCase() !== "tenant" && p.objectId) {
					permission.object = p.objectId;
				}
				return permission;
			});
	};

	const resetState = () => {
		setKeyName("");
		setSelectedPermissions([]);
		setCreatedKey(null);
		setIsCopied(false);
	};

	const handleOpenChange = (next: boolean) => {
		if (isCreating) return;
		setOpen(next);
		if (!next) {
			// Refresh the parent list only after close, so an empty-state instance
			// of this dialog isn't unmounted while the new key is still displayed.
			if (createdKey) void onCreated?.();
			resetState();
		}
	};

	const handleSubmit = async () => {
		if (!keyName.trim()) {
			toast.error("Please enter a name for the API key");
			return;
		}

		const permissions = buildPermissions();
		if (permissions.length === 0) {
			toast.error("Please add at least one permission");
			return;
		}

		setIsCreating(true);
		try {
			const result = await createAPIKey(keyName, permissions);
			setCreatedKey(result.key);
			toast.success("API key created successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create API key",
			);
		} finally {
			setIsCreating(false);
		}
	};

	const handleCopyKey = async () => {
		if (!createdKey) return;
		try {
			await navigator.clipboard.writeText(createdKey);
			toast.success("API key copied to clipboard");
			setIsCopied(true);
		} catch {
			toast.error("Failed to copy API key");
		}
	};

	// While the key is displayed it can't be retrieved again, so only the
	// "Done" button may close the dialog (no outside click / Escape).
	const lockClose = createdKey !== null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Create API Key
				</Button>
			</DialogTrigger>
			<DialogContent
				className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"
				onInteractOutside={(e) => {
					if (lockClose) e.preventDefault();
				}}
				onEscapeKeyDown={(e) => {
					if (lockClose) e.preventDefault();
				}}
			>
				{createdKey ? (
					<div className="grid gap-4">
						<DialogHeader>
							<DialogTitle>API Key Created</DialogTitle>
							<DialogDescription>
								Save this API key now. You won't be able to see it again.
							</DialogDescription>
						</DialogHeader>

						<div className="rounded-md bg-muted p-4">
							<div className="flex items-center justify-between gap-2">
								<code className="break-all text-sm">{createdKey}</code>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={handleCopyKey}
								>
									{isCopied ? <Check /> : <Copy />}
									Copy
								</Button>
							</div>
						</div>

						<Alert color="warning">
							Make sure to copy your API key now. You won't be able to see it
							again!
						</Alert>

						<DialogFooter>
							<Button type="button" onClick={() => handleOpenChange(false)}>
								Done
							</Button>
						</DialogFooter>
					</div>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
						className="grid gap-4"
					>
						<DialogHeader>
							<DialogTitle>Create API Key</DialogTitle>
							<DialogDescription>
								Create a new API key with specific permissions.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-1">
							<Label htmlFor="key-name">Name</Label>
							<Input
								id="key-name"
								placeholder="e.g., CI/CD Pipeline, Analytics Service"
								value={keyName}
								onChange={(e) => setKeyName(e.target.value)}
								disabled={isCreating}
								autoComplete="off"
								autoFocus
							/>
							<p className="text-xs text-muted-foreground">
								A descriptive name to help you identify this key
							</p>
						</div>

						<div className="space-y-2">
							<Label>Permissions</Label>
							<PermissionsSelectorTree
								definitions={definitions} // back to the original, drop sortedDefinitions
								namespaceMap={lowerNamespaceMap}
								value={selectedPermissions}
								onChange={setSelectedPermissions}
								disabled={isCreating}
								showPreview={false}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isCreating}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isCreating || !keyName.trim()}>
								{isCreating && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create API Key
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}

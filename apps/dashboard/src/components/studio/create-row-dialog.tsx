import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { insertTableRow } from "@/app/(dashboard)/(project)/projects/[project_id]/[project_branch]/studio/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateRowDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	columns: { name: string; type: string; format?: string }[];
	project: {
		project_id: string;
		branch_name: string;
	};
	tableName: string;
	schemaName: string;
	onSuccess: () => void;
}

export function CreateRowDialog({
	open,
	onOpenChange,
	columns,
	project,
	tableName,
	schemaName,
	onSuccess,
}: CreateRowDialogProps) {
	const [formData, setFormData] = useState<
		Record<string, string | boolean | null>
	>({});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const payload = { ...formData };

			Object.keys(payload).forEach((key) => {
				if (payload[key] === "") payload[key] = null;
			});

			const result = await insertTableRow(
				project.project_id,
				project.branch_name,
				schemaName,
				tableName,
				payload,
			);
			if (!result.success) throw new Error(result.error);
			toast.success("Row created");
			onSuccess();
			onOpenChange(false);
			setFormData({});
		} catch (e: unknown) {
			console.error(e);
			toast.error(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (col: string, value: string | boolean | null) => {
		setFormData((prev) => ({ ...prev, [col]: value }));
	};

	return (
		<>
			{open && (
				<div
					aria-hidden="true"
					className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
					onClick={() => onOpenChange(false)}
				/>
			)}
			<div
				className={cn(
					"fixed inset-y-0 right-0 z-50 h-full w-full border-l bg-background p-6 shadow-lg transition-transform sm:max-w-sm",
					open ? "translate-x-0" : "translate-x-full",
				)}
				data-testid="create-row-panel"
			>
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Create New Row</h2>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onOpenChange(false)}
						>
							<span className="sr-only">Close</span>
							<X className="h-4 w-4" />
						</Button>
					</div>
					<div
						className="flex-1 overflow-y-auto py-4"
						data-testid="create-row-form"
					>
						<div className="grid gap-4">
							{columns.map((col) => (
								<div key={col.name} className="grid gap-2">
									<Label>
										{col.name}{" "}
										<span className="text-xs text-muted-foreground">
											({col.type})
										</span>
									</Label>
									{col.type === "boolean" ? (
										<div className="flex items-center space-x-2">
											<Checkbox
												checked={formData[col.name] === true}
												onCheckedChange={(c) =>
													handleChange(col.name, c === true)
												}
												id={`create-field-${col.name}`}
												data-testid={`create-field-${col.name}`}
											/>
											<label
												htmlFor={`create-field-${col.name}`}
												className="text-sm font-medium leading-none"
											>
												{col.name}
											</label>
										</div>
									) : (
										<Input
											value={
												typeof formData[col.name] === "string"
													? formData[col.name]
													: ""
											}
											onChange={(e) => handleChange(col.name, e.target.value)}
											placeholder={col.format || col.type}
											data-testid={`create-field-${col.name}`}
										/>
									)}
								</div>
							))}
						</div>
					</div>
					<div className="mt-auto flex justify-end gap-2 pt-4">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={loading}
							data-testid="create-row-submit"
						>
							Create
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}

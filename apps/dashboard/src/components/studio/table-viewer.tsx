"use client";

import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Check,
	ChevronLeft,
	ChevronRight,
	GripVertical,
	Loader2,
	MoreHorizontal,
	Plus,
	RefreshCw,
	Trash,
} from "lucide-react";
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import {
	deleteTableRows,
	fetchTableRows,
} from "@/app/(dashboard)/(project)/projects/[project_id]/[project_branch]/studio/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CreateRowDialog } from "./create-row-dialog";
import { FilterBuilder, type FilterItem } from "./filter-builder";
import { RLSViewer } from "./rls-viewer";

interface ColumnDefinition {
	name: string;
	type: string;
	format?: string;
	isPrimaryKey?: boolean;
}

interface TableViewerProps {
	tableName: string;
	tableDefinition: {
		name: string;
		schemaName: string;
		columns: ColumnDefinition[];
	};
	project: {
		project_id: string;
		branch_name: string;
	};
}

// Local implementation of CheckboxItem for the custom DropdownMenu
const DropdownMenuCheckboxItem = ({
	checked,
	onCheckedChange,
	children,
	...props
}: {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	children: ReactNode;
} & Omit<ComponentProps<typeof DropdownMenuItem>, "onClick" | "children">) => {
	return (
		<DropdownMenuItem
			onClick={(_e) => {
				onCheckedChange(!checked);
			}}
			{...props}
		>
			<Check
				className={cn("mr-2 h-4 w-4", checked ? "opacity-100" : "opacity-0")}
			/>
			{children}
		</DropdownMenuItem>
	);
};

const buttonOutlineSm =
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs";
const buttonGhostIcon =
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0";

export function TableViewer({
	tableName,
	tableDefinition,
	project,
}: TableViewerProps) {
	const [data, setData] = useState<Record<string, unknown>[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(20);
	const [total, setTotal] = useState(0);
	const [sort, setSort] = useState<{
		column: string;
		order: "asc" | "desc";
	} | null>(null);
	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
	const [filters, setFilters] = useState<FilterItem[]>([]);

	// Columns visibility state - load from localStorage if available
	const storageKey = `studio-columns-${tableDefinition.schemaName}-${tableName}`;
	const storageKeyWidths = `studio-column-widths-${tableDefinition.schemaName}-${tableName}`;
	const storageKeyOrder = `studio-column-order-${tableDefinition.schemaName}-${tableName}`;

	const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				try {
					return new Set(JSON.parse(saved));
				} catch {}
			}
		}
		return new Set(tableDefinition.columns.map((c) => c.name));
	});

	// Column widths state - load from localStorage
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
		() => {
			if (typeof window !== "undefined") {
				const saved = localStorage.getItem(storageKeyWidths);
				if (saved) {
					try {
						return JSON.parse(saved);
					} catch {}
				}
			}
			return {};
		},
	);

	// Column order state - load from localStorage
	const [columnOrder, setColumnOrder] = useState<string[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(storageKeyOrder);
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch {}
			}
		}
		return tableDefinition.columns.map((c) => c.name);
	});

	// Reload column widths and order when table changes
	useEffect(() => {
		// Reload widths from localStorage
		const savedWidths = localStorage.getItem(storageKeyWidths);
		if (savedWidths) {
			try {
				setColumnWidths(JSON.parse(savedWidths));
			} catch {
				setColumnWidths({});
			}
		} else {
			setColumnWidths({});
		}

		// Reload order from localStorage
		const savedOrder = localStorage.getItem(storageKeyOrder);
		const defaultOrder = tableDefinition.columns.map((c) => c.name);
		if (savedOrder) {
			try {
				const parsed = JSON.parse(savedOrder) as string[];
				// Validate and sync with current columns
				const currentColumns = new Set(defaultOrder);
				const validOrder = parsed.filter((name) => currentColumns.has(name));
				const newColumns = defaultOrder.filter(
					(name) => !parsed.includes(name),
				);
				setColumnOrder([...validOrder, ...newColumns]);
			} catch {
				setColumnOrder(defaultOrder);
			}
		} else {
			setColumnOrder(defaultOrder);
		}
	}, [storageKeyWidths, storageKeyOrder, tableDefinition.columns]);

	// Persist column visibility to localStorage
	useEffect(() => {
		localStorage.setItem(
			storageKey,
			JSON.stringify(Array.from(visibleColumns)),
		);
	}, [visibleColumns, storageKey]);

	// Persist column widths to localStorage
	useEffect(() => {
		localStorage.setItem(storageKeyWidths, JSON.stringify(columnWidths));
	}, [columnWidths, storageKeyWidths]);

	// Persist column order to localStorage
	useEffect(() => {
		localStorage.setItem(storageKeyOrder, JSON.stringify(columnOrder));
	}, [columnOrder, storageKeyOrder]);

	// Column resize state
	const [resizing, setResizing] = useState<{
		column: string;
		startX: number;
		startWidth: number;
	} | null>(null);

	// Column drag state
	const [draggingColumn, setDraggingColumn] = useState<string | null>(null);
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

	// Handle column resize
	const handleResizeStart = useCallback(
		(e: React.MouseEvent, columnName: string) => {
			e.preventDefault();
			e.stopPropagation();
			const headerCell = (e.target as HTMLElement).closest("th");
			const startWidth = headerCell?.offsetWidth || 150;
			setResizing({
				column: columnName,
				startX: e.clientX,
				startWidth,
			});
		},
		[],
	);

	useEffect(() => {
		if (!resizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			const diff = e.clientX - resizing.startX;
			const newWidth = Math.max(200, resizing.startWidth + diff);
			setColumnWidths((prev) => ({
				...prev,
				[resizing.column]: newWidth,
			}));
		};

		const handleMouseUp = () => {
			setResizing(null);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [resizing]);

	// Handle column drag and drop
	const handleDragStart = useCallback(
		(e: React.DragEvent, columnName: string) => {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", columnName);
			setDraggingColumn(columnName);
		},
		[],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent, columnName: string) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";
			if (columnName !== draggingColumn) {
				setDragOverColumn(columnName);
			}
		},
		[draggingColumn],
	);

	const handleDragLeave = useCallback(() => {
		setDragOverColumn(null);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent, targetColumn: string) => {
		e.preventDefault();
		const sourceColumn = e.dataTransfer.getData("text/plain");

		if (sourceColumn && sourceColumn !== targetColumn) {
			setColumnOrder((prev) => {
				const newOrder = [...prev];
				const sourceIdx = newOrder.indexOf(sourceColumn);
				const targetIdx = newOrder.indexOf(targetColumn);

				if (sourceIdx !== -1 && targetIdx !== -1) {
					newOrder.splice(sourceIdx, 1);
					newOrder.splice(targetIdx, 0, sourceColumn);
				}

				return newOrder;
			});
		}

		setDraggingColumn(null);
		setDragOverColumn(null);
	}, []);

	const handleDragEnd = useCallback(() => {
		setDraggingColumn(null);
		setDragOverColumn(null);
	}, []);

	// Get ordered and visible columns
	const getOrderedVisibleColumns = useCallback(() => {
		return columnOrder
			.filter((name) => visibleColumns.has(name))
			.flatMap((name) => {
				const column = tableDefinition.columns.find((c) => c.name === name);
				return column ? [column] : [];
			});
	}, [columnOrder, visibleColumns, tableDefinition.columns]);

	const [createOpen, setCreateOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [_showRLS, _setShowRLS] = useState(true);

	const inFlightRef = useRef<string | null>(null);

	const fetchTableData = useCallback(async () => {
		const requestKey = JSON.stringify({
			schemaName: tableDefinition.schemaName,
			tableName,
			page,
			pageSize,
			sort,
			filters: filters.map(({ column, operator, value }) => [
				column,
				operator,
				value,
			]),
		});
		if (inFlightRef.current === requestKey) {
			return;
		}
		inFlightRef.current = requestKey;
		setLoading(true);
		try {
			const result = await fetchTableRows(
				project.project_id,
				project.branch_name,
				tableDefinition.schemaName,
				tableName,
				{
					page,
					pageSize,
					sort,
					filters: filters.map(({ column, operator, value }) => ({
						column,
						operator,
						value,
					})),
				},
			);

			if (!result.success) {
				throw new Error(result.error || "Failed to fetch rows");
			}

			setData(result.rows || []);
			setTotal(result.total || 0);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			toast.error(`Error fetching data: ${message}`);
		} finally {
			inFlightRef.current = null;
			setLoading(false);
		}
	}, [
		project.project_id,
		project.branch_name,
		tableDefinition.schemaName,
		tableName,
		page,
		pageSize,
		sort,
		filters,
	]);

	useEffect(() => {
		fetchTableData();
	}, [fetchTableData]);

	const handleSort = (column: string) => {
		setPage(0);
		if (sort?.column === column) {
			if (sort.order === "asc") {
				setSort({ column, order: "desc" });
			} else {
				setSort(null);
			}
		} else {
			setSort({ column, order: "asc" });
		}
	};

	const handleSelectRow = (id: string) => {
		const newSelected = new Set(selectedRows);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedRows(newSelected);
	};

	const primaryKeys = tableDefinition.columns
		.filter((column) => column.isPrimaryKey)
		.map((column) => column.name);

	const getRowId = (row: Record<string, unknown>) => {
		if (primaryKeys.length > 0) {
			return primaryKeys.map((key) => String(row[key])).join("|");
		}
		return String(row.__studio_ctid);
	};

	const handleSelectAll = () => {
		if (selectedRows.size === data.length && data.length > 0) {
			setSelectedRows(new Set());
		} else {
			const newSelected = new Set(data.map((r) => getRowId(r)));
			setSelectedRows(newSelected);
		}
	};

	const handleBulkDelete = async () => {
		setLoading(true);
		try {
			const rows = data.filter((row) => selectedRows.has(getRowId(row)));
			const result = await deleteTableRows(
				project.project_id,
				project.branch_name,
				tableDefinition.schemaName,
				tableName,
				primaryKeys,
				rows,
			);
			if (!result.success) throw new Error(result.error);

			toast.success(`Deleted ${result.deleted ?? rows.length} rows`);
			setSelectedRows(new Set());
			setDeleteDialogOpen(false);
			fetchTableData();
		} catch (e: unknown) {
			console.error(e);
			toast.error(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-full flex-col" data-testid="table-viewer">
			{/* Toolbar */}
			<div className="flex items-center justify-between p-2 border-b gap-2 h-14 bg-background px-4">
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-lg">{tableName}</h3>
					<Badge variant="outline">{total} rows</Badge>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchTableData()}
						title="Refresh"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					</Button>
					<FilterBuilder
						columns={tableDefinition.columns}
						onApply={(next) => {
							setFilters(next);
							setPage(0);
						}}
					/>

					<DropdownMenu>
						<DropdownMenuTrigger
							className={buttonOutlineSm}
							data-testid="column-visibility-toggle"
						>
							Columns
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-48 max-h-96 overflow-auto"
						>
							{tableDefinition.columns.map((col) => (
								<DropdownMenuCheckboxItem
									key={col.name}
									checked={visibleColumns.has(col.name)}
									onCheckedChange={(checked: boolean) => {
										const newSet = new Set(visibleColumns);
										if (checked) newSet.add(col.name);
										else newSet.delete(col.name);
										setVisibleColumns(newSet);
									}}
									data-testid={`toggle-column-${col.name}`}
								>
									{col.name}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						size="sm"
						className="gap-1"
						onClick={() => setCreateOpen(true)}
						data-testid="add-row-button"
					>
						<Plus className="h-4 w-4" /> New Row
					</Button>
					<div
						className={cn(
							"flex items-center gap-2",
							selectedRows.size === 0 && "hidden",
						)}
						data-testid="bulk-actions"
					>
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
							data-testid="bulk-update-button"
						>
							Edit ({selectedRows.size})
						</Button>
						<Button
							variant="destructive"
							size="sm"
							className="gap-1"
							onClick={() => setDeleteDialogOpen(true)}
							data-testid="bulk-delete-button"
						>
							<Trash className="h-4 w-4" /> Delete ({selectedRows.size})
						</Button>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-auto bg-muted/5 relative">
				{/* Resize overlay to prevent text selection during resize */}
				{resizing && (
					<div
						className="fixed inset-0 z-50 cursor-col-resize"
						style={{ pointerEvents: "all" }}
					/>
				)}
				<div className="min-w-full inline-block align-middle">
					<div className="border rounded-md m-2 bg-background overflow-x-auto">
						<Table style={{ tableLayout: "fixed", minWidth: "100%" }}>
							<TableHeader
								className="sticky top-0 bg-background z-10"
								data-testid="sticky-header"
							>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox
											checked={
												selectedRows.size === data.length && data.length > 0
											}
											onCheckedChange={handleSelectAll}
											data-testid="select-all-checkbox"
										/>
									</TableHead>
									{getOrderedVisibleColumns().map((col) => (
										<TableHead
											key={col.name}
											className={cn(
												"whitespace-nowrap relative group select-none",
												draggingColumn === col.name && "opacity-50",
												dragOverColumn === col.name &&
													"border-l-2 border-l-primary",
											)}
											style={{
												width: columnWidths[col.name]
													? `${columnWidths[col.name]}px`
													: "300px",
												minWidth: "200px",
											}}
											draggable
											onDragStart={(e) => handleDragStart(e, col.name)}
											onDragOver={(e) => handleDragOver(e, col.name)}
											onDragLeave={handleDragLeave}
											onDrop={(e) => handleDrop(e, col.name)}
											onDragEnd={handleDragEnd}
											data-testid={`column-header-${col.name}`}
											aria-sort={
												sort?.column === col.name
													? sort.order === "asc"
														? "ascending"
														: "descending"
													: "none"
											}
										>
											<div className="flex items-center">
												<GripVertical
													className="h-4 w-4 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity mr-1 shrink-0"
													data-testid={`drag-handle-${col.name}`}
												/>
												<button
													type="button"
													className="flex items-center gap-1 cursor-pointer hover:text-primary flex-1 min-w-0 bg-transparent p-0 text-left font-inherit"
													onClick={() => handleSort(col.name)}
													data-testid={`sort-button-${col.name}`}
												>
													<span className="font-medium truncate">
														{col.name}
													</span>
													<span
														className="text-xs text-muted-foreground font-normal ml-1 flex-shrink-0"
														data-testid={`column-type-${col.name}`}
													>
														({col.type})
													</span>
													{col.isPrimaryKey && (
														<span
															className="text-[10px] text-primary font-bold ml-1 border rounded px-1 flex-shrink-0"
															data-testid={`column-constraint-${col.name}`}
														>
															PK
														</span>
													)}
													{sort?.column === col.name ? (
														sort.order === "asc" ? (
															<ArrowUp className="h-3 w-3 shrink-0" />
														) : (
															<ArrowDown className="h-3 w-3 shrink-0" />
														)
													) : (
														<ArrowUpDown className="h-3 w-3 opacity-50 shrink-0" />
													)}
												</button>
												{/* biome-ignore lint/a11y/useSemanticElements: drag handle, not a thematic break */}
												<div
													role="separator"
													aria-orientation="vertical"
													aria-label={`Resize ${col.name}`}
													className={cn(
														"absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border hover:bg-primary transition-colors",
														resizing?.column === col.name
															? "opacity-100 bg-primary"
															: "opacity-0 group-hover:opacity-100",
													)}
													onMouseDown={(e) => handleResizeStart(e, col.name)}
													data-testid={`resize-handle-${col.name}`}
												/>
											</div>
										</TableHead>
									))}
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading && data.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={tableDefinition.columns.length + 2}
											className="h-24 text-center"
										>
											<Loader2 className="h-6 w-6 animate-spin mx-auto" />
										</TableCell>
									</TableRow>
								) : (
									data.map((row, idx) => (
										<TableRow
											key={getRowId(row)}
											data-testid={`table-row-${idx}`}
										>
											<TableCell>
												<Checkbox
													checked={selectedRows.has(getRowId(row))}
													onCheckedChange={() => handleSelectRow(getRowId(row))}
													data-testid={`row-checkbox-${idx}`}
												/>
											</TableCell>
											{getOrderedVisibleColumns().map((col) => {
												const isForeignKey =
													col.name.endsWith("_id") && !col.isPrimaryKey;
												const cellValue = row[col.name];
												return (
													<TableCell
														key={col.name}
														className="whitespace-nowrap truncate"
														style={{
															width: columnWidths[col.name]
																? `${columnWidths[col.name]}px`
																: "300px",
															minWidth: "200px",
															maxWidth: columnWidths[col.name]
																? `${columnWidths[col.name]}px`
																: "500px",
														}}
														title={String(cellValue)}
													>
														{cellValue === null ? (
															<span className="text-muted-foreground italic">
																null
															</span>
														) : isForeignKey ? (
															<a
																href={`/projects/${project.project_id}/${project.branch_name}/studio?table=${col.name.replace("_id", "s")}&id=${cellValue}`}
																className="text-primary hover:underline"
																data-testid={`fk-link-${col.name}`}
															>
																{String(cellValue)}
															</a>
														) : (
															String(cellValue)
														)}
													</TableCell>
												);
											})}
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger className={buttonGhostIcon}>
														<MoreHorizontal className="h-4 w-4" />
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => {
																setSelectedRows(new Set([getRowId(row)]));
																setDeleteDialogOpen(true);
															}}
														>
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>

			{/* Pagination */}
			<div
				className="flex items-center justify-between p-2 border-t text-sm bg-background px-4"
				data-testid="pagination"
			>
				<div className="flex items-center gap-4">
					<div className="text-muted-foreground">
						{total === 0
							? "No rows"
							: `Showing ${page * pageSize + 1} to ${Math.min((page + 1) * pageSize, total)} of ${total}`}
					</div>
					<Select
						value={String(pageSize)}
						onValueChange={(v) => {
							setPageSize(Number(v));
							setPage(0);
						}}
					>
						<SelectTrigger
							className="h-8 w-[100px]"
							data-testid="page-size-select"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
							<SelectItem value="100">100</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="min-w-[20px] text-center">{page + 1}</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => p + 1)}
						disabled={(page + 1) * pageSize >= total}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<RLSViewer
				project={project}
				tableName={tableName}
				schemaName={tableDefinition.schemaName}
			/>

			{/* Dialogs */}
			<CreateRowDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				columns={tableDefinition.columns}
				project={project}
				tableName={tableName}
				schemaName={tableDefinition.schemaName}
				onSuccess={fetchTableData}
			/>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent data-testid="confirm-dialog">
					<DialogHeader>
						<DialogTitle>Confirm Delete</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete {selectedRows.size} row(s)? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							data-testid="confirm-dialog-cancel"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleBulkDelete}
							disabled={loading}
							data-testid="confirm-dialog-confirm"
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

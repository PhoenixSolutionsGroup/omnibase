"use client";

import { useState, useEffect, useCallback } from "react";
import { PostgrestClient } from "@supabase/postgrest-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Plus,
  Trash,
  RefreshCw,
  Filter,
  Check,
  GripVertical,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CreateRowDialog } from "./create-row-dialog";
import { RLSViewer } from "./rls-viewer";
import { RLSSimulator } from "./rls-simulator";
import { FilterBuilder, FilterItem } from "./filter-builder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ColumnDefinition {
  name: string;
  type: string;
  format: string;
  isPrimaryKey?: boolean;
}

interface TableViewerProps {
  client: PostgrestClient<any>;
  tableName: string;
  tableDefinition: {
    name: string;
    schemaName: string;
    columns: ColumnDefinition[];
  };
  project: any;
  onSimulate: (token: string | null) => void;
}

// Local implementation of CheckboxItem for the custom DropdownMenu
const DropdownMenuCheckboxItem = ({
  checked,
  onCheckedChange,
  children,
  ...props
}: any) => {
  return (
    <DropdownMenuItem
      onClick={(e) => {
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
  client,
  tableName,
  tableDefinition,
  project,
  onSimulate,
}: TableViewerProps) {
  const [data, setData] = useState<any[]>([]);
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
      .map((name) => tableDefinition.columns.find((c) => c.name === name)!)
      .filter(Boolean);
  }, [columnOrder, visibleColumns, tableDefinition.columns]);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showRLS, setShowRLS] = useState(true);

  const fetchTableData = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;
      setLoading(true);
      try {
        let query = client
          .schema(tableDefinition.schemaName)
          .from(tableName)
          .select("*", { count: "exact" });

        if (sort) {
          query = query.order(sort.column, { ascending: sort.order === "asc" });
        }

        // Apply filters
        filters.forEach((f) => {
          if (!f.value && f.operator !== "is") return;
          let val = f.value;
          if (f.operator === "ilike" && !val.includes("%")) val = `%${val}%`;
          query = query.filter(f.column, f.operator, val);
        });

        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data: rows, error, count } = await query;

        console.log("[TableViewer] Query result:", {
          tableName,
          schemaName: tableDefinition.schemaName,
          rowCount: rows?.length,
          totalCount: count,
          error: error ? JSON.stringify(error) : null,
        });

        if (error) {
          throw error;
        }

        setData(rows || []);
        setTotal(count || 0);
      } catch (err: any) {
        const isTransientError =
          err.message?.includes("schema cache") ||
          err.message?.includes("Retrying") ||
          err.code === "PGRST503";

        if (isTransientError && retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchTableData(retryCount + 1);
        }

        toast.error(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [client, tableName, page, pageSize, sort, filters],
  );

  useEffect(() => {
    setPage(0);
    setSelectedRows(new Set());
    fetchTableData();
  }, [tableName, sort, pageSize, filters]);

  useEffect(() => {
    fetchTableData();
  }, [page]);

  const handleSort = (column: string) => {
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

  const pkCol =
    tableDefinition.columns.find((c) => c.isPrimaryKey)?.name || "id";

  const getRowId = (row: any) => {
    if (row[pkCol] !== undefined) return String(row[pkCol]);
    return JSON.stringify(row);
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
      const ids = Array.from(selectedRows);
      if (!tableDefinition.columns.find((c) => c.name === pkCol)) {
        throw new Error(
          `Cannot delete: No primary key found (assumed '${pkCol}')`,
        );
      }

      const { error } = await client
        .schema(tableDefinition.schemaName)
        .from(tableName)
        .delete()
        .in(pkCol, ids);
      if (error) throw error;

      toast.success(`Deleted ${ids.length} rows`);
      setSelectedRows(new Set());
      setDeleteDialogOpen(false);
      fetchTableData();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
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
            onApply={setFilters}
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
                  <TableHead className="w-[40px]">
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
                    >
                      <div className="flex items-center">
                        <GripVertical
                          className="h-4 w-4 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity mr-1 flex-shrink-0"
                          data-testid={`drag-handle-${col.name}`}
                        />
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:text-primary flex-1 min-w-0"
                          onClick={() => handleSort(col.name)}
                          data-testid={`sort-button-${col.name}`}
                          aria-sort={
                            sort?.column === col.name
                              ? sort.order === "asc"
                                ? "ascending"
                                : "descending"
                              : undefined
                          }
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
                              <ArrowUp className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <ArrowDown className="h-3 w-3 flex-shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                          )}
                        </div>
                        <div
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
                                href={`/projects/${project.project_group_id}/${project.branch_name}/studio?table=${col.name.replace("_id", "s")}&id=${cellValue}`}
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
            onValueChange={(v) => setPageSize(Number(v))}
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

      {/* RLS Panels */}
      <RLSViewer
        project={project}
        tableName={tableName}
        schemaName={tableDefinition.schemaName}
      />
      <RLSSimulator project={project} onSimulate={onSimulate} />

      {/* Dialogs */}
      <CreateRowDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        columns={tableDefinition.columns}
        client={client}
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

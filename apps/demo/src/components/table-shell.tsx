import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type TableColumn<T> = {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
};

type TableShellProps<T> = {
  columns: TableColumn<T>[];
  items: T[];
  getRowId?: (item: T, index: number) => string;
  emptyText?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export default function TableShell<T>({
  columns,
  items,
  getRowId = (_item, index) => String(index),
  emptyText = "No results.",
  page = 1,
  totalPages = 1,
  onPageChange,
}: TableShellProps<T>) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden p-0">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) => (
                <TableHead
                  key={`${column.header}-${i}`}
                  className={
                    column.align === "right" ? "text-right" : undefined
                  }
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, rowIndex) => (
                <TableRow key={getRowId(item, rowIndex)}>
                  {columns.map((column, i) => (
                    <TableCell
                      key={`${column.header}-${i}`}
                      className={[
                        column.align === "right" ? "text-right" : "",
                        column.className ?? "",
                      ]
                        .join(" ")
                        .trim()}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey != null
                          ? String(item[column.accessorKey] ?? "")
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full shrink-0 items-center justify-between border-t p-2">
        <p>{items.length} items</p>
        <div className="flex gap-2 items-center">
          <p>
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={!onPageChange || page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            disabled={!onPageChange || page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </Card>
  );
}

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

export default function TableShell() {
  const currentPage = 1;
  const totalPages = 7;
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden p-0">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full shrink-0 items-center justify-between border-t p-2">
        <p>items selected</p>
        <div className="flex gap-2 items-center">
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <Button variant="outline">
            <ChevronLeft />
          </Button>
          <Button variant="outline">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </Card>
  );
}

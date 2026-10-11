"use client";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import TableShell, { type TableColumn } from "@/components/table-shell";
import Link from "next/link";

type Payments = {
  date: string;
  amount: number;
};

const columns: TableColumn<Payments>[] = [
  { header: "Date", accessorKey: "date", className: "font-medium" },
  { header: "Amount", accessorKey: "amount" },
];

const payments: Payments[] = [
  { date: new Date().toDateString(), amount: 50 },
  { date: new Date().toDateString(), amount: 10 },
];

export default function Payments() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold">Payments</h2>
        <p>Manage your subscription</p>
      </div>
      <div className="flex justify-between items-center">
        <SearchBar />
        <Link href="/payments/edit">
          <Button>
            <Edit />
            Change Subscription
          </Button>
        </Link>
      </div>
      <TableShell columns={columns} items={payments} />
    </div>
  );
}

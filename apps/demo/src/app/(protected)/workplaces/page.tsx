"use client";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableShell, { type TableColumn } from "@/components/table-shell";
import Link from "next/link";

type Workplace = {
  name: string;
  shifts: number;
};

const columns: TableColumn<Workplace>[] = [
  { header: "Name", accessorKey: "name", className: "font-medium" },
  { header: "Shifts", accessorKey: "shifts" },
];

const workplaces: Workplace[] = [
  { name: "Warehouse Sydney", shifts: 4 },
  { name: "Warehouse Melbourne", shifts: 2 },
];

export default function Workplaces() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold">Workplaces</h2>
        <p>Create, edit and remove workplaces for your organisation.</p>
      </div>
      <div className="flex justify-between items-center">
        <SearchBar />
        <Link href="/workplaces/new">
          <Button>
            <Plus />
            New Workplace
          </Button>
        </Link>
      </div>
      <TableShell columns={columns} items={workplaces} />
    </div>
  );
}

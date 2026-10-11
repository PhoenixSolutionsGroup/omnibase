"use client";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableShell, { type TableColumn } from "@/components/table-shell";
import Link from "next/link";

type Schedule = {
  name: string;
  workplace: string;
  shifts: number;
  workers: number;
};

const columns: TableColumn<Schedule>[] = [
  { header: "Name", accessorKey: "name", className: "font-medium" },
  { header: "Workplace", accessorKey: "workplace" },
  { header: "Shifts", accessorKey: "shifts" },
  { header: "Workers", accessorKey: "workers" },
];

// fetch from backend, only tenant if role is viewer, otherwise all of the current org
const schedules: Schedule[] = [
  { name: "Monday", workplace: "Warehouse Sydney", shifts: 4, workers: 8 },
  { name: "Tuesday", workplace: "Warehouse Cairns", shifts: 2, workers: 5 },
];

export default function Schedules() {
  const canAddSchedule = true; // will come from omnibase backend role
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold">Schedules</h2>
        <p>Create, edit and update schedules for your organisation.</p>
      </div>
      <div className="flex justify-between items-center">
        <SearchBar />
        {canAddSchedule && (
          <Link href="/schedules/new">
            <Button>
              <Plus />
              New Schedule
            </Button>
          </Link>
        )}
      </div>
      <TableShell columns={columns} items={schedules} />
    </div>
  );
}

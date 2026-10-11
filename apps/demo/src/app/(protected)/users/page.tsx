"use client";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableShell, { type TableColumn } from "@/components/table-shell";
import Link from "next/link";

type Schedule = {
  name: string;
  role: string;
};

const columns: TableColumn<Schedule>[] = [
  { header: "Name", accessorKey: "name", className: "font-medium" },
  { header: "Role", accessorKey: "role" },
];

const schedules: Schedule[] = [
  { name: "Max Meiers", role: "Owner" },
  { name: "Sandra Smith", role: "Admin" },
  { name: "Ben Bauer", role: "Viewer" },
];

export default function Users() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold">Users</h2>
        <p>Invite team members and manage user roles.</p>
      </div>
      <div className="flex justify-between items-center">
        <SearchBar />
        <Link href="/users/new">
          <Button>
            <Plus />
            Invite User
          </Button>
        </Link>
      </div>
      <TableShell columns={columns} items={schedules} />
    </div>
  );
}

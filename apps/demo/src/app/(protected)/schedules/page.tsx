import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableShell from "@/components/table-shell";
import Link from "next/link";

export default function Schedules() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold">Schedules</h2>
        <p>Create, edit and remove schedules for your organisation.</p>
      </div>
      <div className="flex justify-between items-center">
        <SearchBar />
        <Link href="/schedules/new">
          <Button>
            <Plus />
            New Schedule
          </Button>
        </Link>
      </div>
      <TableShell />
    </div>
  );
}

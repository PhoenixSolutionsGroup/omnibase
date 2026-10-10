import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableShell from "@/components/table-shell";

export default function Users() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold">Users</h2>
        <p>Invite team members and manage users roles.</p>
      </div>
      <div className="flex justify-between items-center">
        <SearchBar />
        <Button>
          <Plus />
          Invite User
        </Button>
      </div>
      <TableShell />
    </div>
  );
}

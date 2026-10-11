"use client";

import PaginatedSelect from "@/components/paginated-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import Basic from "./basic";

const roleItems = [
  { label: "Admin", value: "id-123" },
  { label: "Viewer", value: "id-124" },
];

export default function NewUser() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-4 h-full max-w-200 w-full ">
        <div className="flex justify-between">
          <div className="flex flex-col ">
            <h2 className="text-xl font-bold">New Team Member</h2>
            <p>Invite a new team member.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/users">
              <Button variant={"outline"}>Cancel</Button>
            </Link>
            <Button>
              <Plus />
              Invite Team Member
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex gap-0 flex-col">
            <span className="font-bold">1. Basic Information</span>
            <span className="text-xs">
              Enter the details of the team member.
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Basic />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex gap-0 flex-col">
            <span className="font-bold">2. Role</span>
            <span className="text-xs">
              Select which role this team member should have.
            </span>
          </CardHeader>
          <CardContent>
            <PaginatedSelect items={roleItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import Basic from "./basic";
import Shift from "./shift";
import ShiftList from "./shift-list";

export default function NewSchedule() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-4 h-full max-w-200 w-full ">
        <div className="flex justify-between">
          <div className="flex flex-col ">
            <h2 className="text-xl font-bold">New Workplace</h2>
            <p>Create a new workplace for your organisation.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/workplaces">
              <Button variant={"outline"}>Cancel</Button>
            </Link>
            <Button>
              <Plus />
              Create Workplace
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Card>
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold">1. Basics</span>
              <span className="text-xs">
                Add basic details for this workplace.
              </span>
            </CardHeader>
            <CardContent>
              <Basic />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold">2. Shifts</span>
              <span className="text-xs">
                Add shifts exist and how many people are needed.
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              List team members table. Member 1 member 2 Warehouse 3 Each shift
              has: from to notes (which area or anything special to do during
              that shift) amount of people
              <ShiftList />
              <div className="flex gap-2">add a shift</div>
              <Shift />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

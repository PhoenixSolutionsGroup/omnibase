import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function NewSchedule() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-4 h-full max-w-200 w-full ">
        <div className="flex justify-between">
          <div className="flex flex-col ">
            <h2 className="text-xl font-bold">New Schedule</h2>
            <p>Create a new schedule for your organisation.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/schedules">
              <Button variant={"outline"}>Cancel</Button>
            </Link>
            <Button>
              <Plus />
              Generate Schedule
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Card>
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold">1. Workplace</span>
              <span className="text-xs">
                Select which workplace this schedule is for.
              </span>
            </CardHeader>
            <CardContent>
              List workplace table. Warehouse 1 Warehouse 2 Warehouse 3
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold">2. Employes</span>
              <span className="text-xs">
                Select which employes are available.
              </span>
            </CardHeader>
            <CardContent>
              List team members table. Member 1 member 2 Warehouse 3
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold">3. Generate</span>
              <span className="text-xs">
                Autmatically generate your schedule.
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <span>
                Our algorithm will create the perfect schedule for you. All team
                member wishes, absences and regulations are considered. Just
                click <span className="font-bold">Generate Schedule</span>
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

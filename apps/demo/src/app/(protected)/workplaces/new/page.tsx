import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import Basic from "./basic";
import Shift from "./shift";
import ShiftList from "./shift-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import shift from "./shift";

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
              <Accordion className="rounded-lg border" defaultValue={["1"]}>
                <AccordionItem className="border-b px-4 last:border-b-0 hover:no-underline!">
                  <AccordionTrigger>
                    <div className="flex gap-2">
                      <span>Add new shift</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Shift />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <hr></hr>
              <ShiftList />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

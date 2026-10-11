"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";

// Builds a Date at the given hour, offset by whole days from today.
const at = (hour: number, dayOffset = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const shifts = [
  {
    id: "1",
    name: "Morning shift",
    notes: "Morning shift",
    from: at(6),
    to: at(14),
    workersNeeded: 2,
  },
  {
    id: "2",
    name: "Lunch shift",
    notes: "",
    from: at(14),
    to: at(22),
    workersNeeded: 1,
  },
  {
    id: "3",
    name: "Night shift",
    notes: "Make sure to check the back alley",
    from: at(22),
    to: at(6, 1), // ends the next morning
    workersNeeded: 5,
  },
];

const formatTime = (date: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

export default function ShiftList() {
  // Start with a fixed locale so server and client render the same HTML,
  // then switch to the browser's locale after mount (avoids hydration mismatch).
  const [locale, setLocale] = useState<string>("fi-FI");

  useEffect(() => {
    setLocale(navigator.language);
  }, []);

  const deleteShift = () => {};

  return (
    <Accordion className="rounded-lg border" defaultValue={["1"]}>
      {shifts.map((shift) => (
        <AccordionItem
          key={shift.id}
          value={shift.id}
          className="border-b px-4 last:border-b-0 hover:no-underline!"
        >
          <AccordionTrigger>
            <div className="flex gap-2">
              <span>{shift.name}</span>-
              <span>
                {formatTime(shift.from, locale)} -{" "}
                {formatTime(shift.to, locale)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col">
              <span>Workers needed: {shift.workersNeeded}</span>
              <span>{shift.notes}</span>
              <div className="flex justify-end">
                <Button variant="outline" onClick={deleteShift}>
                  <Trash />
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

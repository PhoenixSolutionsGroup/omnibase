"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge, BadgeCheck, CircleCheck, CircleX, Save } from "lucide-react";
import Link from "next/link";

export default function NewSchedule() {
  const [subscription, setSubscription] = useState<string>("basic");
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-4 h-full max-w-200 w-full ">
        <div className="flex justify-between">
          <div className="flex flex-col ">
            <h2 className="text-xl font-bold">Edit Subscription</h2>
            <p>Update your current subscription.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/payments">
              <Button variant={"outline"}>Cancel</Button>
            </Link>
            <Button>
              <Save />
              Save Schedule
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Card
            className={`${subscription === "free" ? "shadow-2xl" : ""} hover:shadow-lg cursor-pointer `}
            onClick={() => setSubscription("free")}
          >
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold">Free</span>
              <span className="text-xs">Perfect to test Shiftly</span>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> 5 Team Members
                </div>
                <hr />
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> 10 Schedules
                </div>
                <hr />
                <div className="flex gap-2 items-center">
                  <CircleX className="w-4 h-4" /> Support
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`${subscription === "basic" ? "shadow-2xl" : ""} hover:shadow-lg cursor-pointer `}
            onClick={() => setSubscription("basic")}
          >
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold flex items-center gap-1">
                <Badge className="w-4 h-4" /> Basic
              </span>
              <span className="text-xs">Perfect for small businesses</span>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> 15 Team Members
                </div>
                <hr />
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> 30 Schedules
                </div>
                <hr />
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> E-Mail Support
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`${subscription === "premium" ? "shadow-2xl" : ""} hover:shadow-lg cursor-pointer `}
            onClick={() => setSubscription("premium")}
          >
            <CardHeader className="flex gap-0 flex-col">
              <span className="font-bold flex items-center gap-1">
                <BadgeCheck className="w-4 h-4" /> Premium
              </span>
              <span className="text-xs">All features and no limitations</span>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> Unlimited Team Members
                </div>
                <hr />
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> Unlimited Schedules
                </div>
                <hr />
                <div className="flex gap-2 items-center">
                  <CircleCheck className="w-4 h-4" /> 24h Support
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

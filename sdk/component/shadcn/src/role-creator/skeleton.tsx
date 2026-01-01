"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function RoleCreatorSkeleton() {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-7 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Name Input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Separator />

        {/* Permissions Label */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />

          {/* Permission Row */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

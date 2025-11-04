"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LimitSelectorProps {
  projectId: string;
  activeService: string;
  currentLimit: number;
}

export function LimitSelector({
  projectId,
  activeService,
  currentLimit,
}: LimitSelectorProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Limit:</span>
      <Select
        value={currentLimit.toString()}
        onValueChange={(value) => {
          window.location.href = `/projects/${projectId}/logs?logs=${activeService}&limit=${value}`;
        }}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

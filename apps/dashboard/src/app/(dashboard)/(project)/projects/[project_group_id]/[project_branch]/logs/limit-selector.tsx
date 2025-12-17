"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LimitSelectorProps {
  project_group_id: string;
  project_branch: string;
  activeService: string;
  currentLimit: number;
}

export function LimitSelector({
  project_branch,
  project_group_id,
  activeService,
  currentLimit,
}: LimitSelectorProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Limit:</span>
      <Select
        value={currentLimit.toString()}
        onValueChange={(value) => {
          window.location.href = `/projects/${project_group_id}/${project_branch}/logs?service_type=${activeService}&limit=${value}`;
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

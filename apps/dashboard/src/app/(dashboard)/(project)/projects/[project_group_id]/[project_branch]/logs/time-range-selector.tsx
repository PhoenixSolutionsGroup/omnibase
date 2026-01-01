"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  project_group_id: string;
  project_branch: string;
  activeService: string;
  limit: number;
  currentRange: string;
}

export function TimeRangeSelector({
  project_branch,
  project_group_id,
  activeService,
  limit,
  currentRange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Time Range:</span>
      <Select
        value={currentRange}
        onValueChange={(value) => {
          window.location.href = `/projects/${project_group_id}/${project_branch}/logs?service_type=${activeService}&limit=${limit}&time_range=${value}`;
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1h">Last 1 Hour</SelectItem>
          <SelectItem value="6h">Last 6 Hours</SelectItem>
          <SelectItem value="24h">Last 24 Hours</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

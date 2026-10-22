import { ShieldUser, UsersRound } from "lucide-react";

export function Roles() {
  return (
    <div className="flex gap-2 p-4">
      {/* Circle one */}
      <div
        aria-hidden="true"
        className="relative flex size-40 shrink-0 items-center justify-center rounded-full border border-border"
      >
        {/* Orbiting dot */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] motion-reduce:animate-none">
          <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground group-hover:bg-primary duration-500" />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-8 text-muted-foreground transition-colors group-hover:text-primary duration-500">
          <ShieldUser className="size-8" />
        </div>
      </div>
      {/* Circle two */}
      <div
        aria-hidden="true"
        className="relative flex size-40 shrink-0 items-center justify-center rounded-full border border-border"
      >
        {/* Orbiting dot */}
        {/* <div className="absolute inset-0 animate-[spin_15s_linear_infinite] motion-reduce:animate-none">
          <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground " />
        </div> */}

        {/* Icons */}
        <div className="flex items-center gap-8 text-muted-foreground transition-colors">
          <UsersRound className="size-8" />
        </div>
      </div>
    </div>
  );
}

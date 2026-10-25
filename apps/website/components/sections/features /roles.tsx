import { ShieldUser, UsersRound } from "lucide-react";

export function Roles() {
  return (
    <div
      aria-hidden="true"
      className="relative h-50 w-full transition-transform duration-300 group-hover:-translate-y-1"
    >
      <div className="absolute left-4 top-4 flex gap-2">
        {/* Circle one */}
        <div className="relative flex size-40 shrink-0 items-center justify-center rounded-full border border-border">
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
        <div className="relative flex size-40 shrink-0 items-center justify-center rounded-full border border-border">
          <div className="flex items-center gap-8 text-muted-foreground transition-colors">
            <UsersRound className="size-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

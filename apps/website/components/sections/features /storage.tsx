import { File, Image, Video, type LucideIcon } from "lucide-react";

function StorageItem({
  icon: Icon,
  highlight = false,
}: {
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "text-ring border rounded-lg p-4 transition-colors group-hover:text-primary duration-500"
          : "text-ring border rounded-lg p-4"
      }
    >
      <Icon />
    </div>
  );
}

const rows: { icon: LucideIcon; highlighted: number[] }[] = [
  { icon: Video, highlighted: [2, 4] },
  { icon: File, highlighted: [3, 5] },
  { icon: Image, highlighted: [1] },
];

export function Storage() {
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ icon, highlighted }) => (
        <div key={icon.displayName} className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <StorageItem
              key={id}
              icon={icon}
              highlight={highlighted.includes(id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

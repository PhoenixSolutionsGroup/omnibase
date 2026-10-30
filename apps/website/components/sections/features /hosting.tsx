import { Monitor } from "lucide-react";

const CUBE_OUTLINE = "M100 78 L145 104 L145 156 L100 182 L55 156 L55 104 Z";
const DURATION = 20;
const DOTS = 4;

export function Hosting() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className="mx-auto h-48 w-full max-w-50 transition-transform duration-300 group-hover:-translate-y-1"
    >
      <Monitor
        x={84}
        y={114}
        width={32}
        height={32}
        className="text-muted-foreground transition-colors group-hover:text-primary"
      />

      {/* Dashed cube */}
      <g
        fill="none"
        strokeWidth={1.25}
        strokeDasharray="4 4"
        strokeLinejoin="round"
        className="stroke-muted-foreground/60"
      >
        <path d={CUBE_OUTLINE} />
        <path d="M55 104 L100 130 L145 104 M100 130 L100 182" />
      </g>

      {/* Dots running around the outer edge */}
      {Array.from({ length: DOTS }, (_, i) => (
        <circle
          key={i}
          r={2.5}
          className="fill-muted-foreground motion-reduce:hidden group-hover:fill-primary duration-500"
        >
          <animateMotion
            path={CUBE_OUTLINE}
            dur={`${DURATION}s`}
            begin={`${-(i * DURATION) / DOTS}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

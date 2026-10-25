import { Database, User } from "lucide-react";

const xs = [40, 100, 160];

const topPaths = [
  "M40 36 C40 60 100 56 100 78",
  "M100 36 L100 78",
  "M160 36 C160 60 100 56 100 78",
];

const bottomPaths = [
  "M100 122 C100 144 40 140 40 164",
  "M100 122 L100 164",
  "M100 122 C100 144 160 140 160 164",
];

const CYCLE = 20; // seconds per full loop
const TRAVEL = 0.25; // fraction of the loop spent crossing one line
const HOP = CYCLE * TRAVEL; // seconds to cross one line
const SLOT = CYCLE / 6; // spacing between the start of each of the 6 trips

type PulseProps = {
  d: string;
  begin: number;
  reverse?: boolean;
};

function Pulse({ d, begin, reverse = false }: PulseProps) {
  return (
    <circle
      r={2.5}
      opacity={0}
      className="fill-muted-foreground motion-reduce:hidden group-hover:fill-primary duration-500"
    >
      <animateMotion
        path={d}
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        calcMode="linear"
        keyPoints={reverse ? "1;0;0" : "0;1;1"}
        keyTimes={`0;${TRAVEL};1`}
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0;0"
        keyTimes={`0;0.05;${TRAVEL - 0.05};${TRAVEL};1`}
        dur={`${CYCLE}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

export function MultiTenancy() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className="mx-auto h-48 w-full max-w-50"
    >
      {/* Lines */}
      <g fill="none" strokeWidth={1} className="stroke-border">
        {topPaths.map((d) => (
          <path key={d} d={d} />
        ))}
        {bottomPaths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Dots */}
      {topPaths.map((d, i) => {
        const outward = i * SLOT; // 0, 1, 2 s
        const back = i * SLOT + CYCLE / 2; // 3, 4, 5 s
        return (
          <g key={`dots-${d}`}>
            {/* Outward: user -> logo, then logo -> database */}
            <Pulse d={d} begin={outward} />
            <Pulse d={bottomPaths[i]} begin={outward + HOP} />
            {/* Back: database -> logo, then logo -> user */}
            <Pulse d={bottomPaths[i]} begin={back} reverse />
            <Pulse d={d} begin={back + HOP} reverse />
          </g>
        );
      })}

      {/* Users */}
      {xs.map((cx) => (
        <User
          key={`user-${cx}`}
          x={cx - 12}
          y={8}
          width={24}
          height={24}
          className="text-muted-foreground transition-colors"
        />
      ))}

      {/* Logo */}
      <image
        href="/omnibase-logo.svg"
        x={80}
        y={80}
        width={40}
        height={40}
        preserveAspectRatio="xMidYMid meet"
        className="grayscale transition-[filter] duration-500 group-hover:grayscale-0"
      />

      {/* Databases */}
      {xs.map((cx) => (
        <Database
          key={`db-${cx}`}
          x={cx - 12}
          y={164}
          width={24}
          height={24}
          className="text-muted-foreground transition-colors"
        />
      ))}
    </svg>
  );
}

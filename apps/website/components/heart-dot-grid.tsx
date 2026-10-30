import { useMemo } from "react";

// ---- Tweak these ----------------------------------------------------------
const COLS = 47; // grid columns
const ROWS = 31; // grid rows
const CELL = 16; // square size (svg units)
const GAP = 4; // space between squares
const RADIUS = 4; // corner radius
const BG_OPACITY = 0.45; // max opacity of the background squares (center)
const FADE_START = 0.3; // 0 = fade from the very center, 1 = no fade
const HEART_SCALE = 9.5; // heart size in cells (bigger = bigger heart)
const HEART_HEIGHT = 0.9; // vertical squash: 1 = original, lower = shorter heart (width unchanged)
const SEED = 7; // change for a different color pattern
// ---------------------------------------------------------------------------

const PITCH = CELL + GAP;
const WIDTH = COLS * PITCH - GAP;
const HEIGHT = ROWS * PITCH - GAP;

// Small deterministic PRNG so server and client render identical output
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Classic implicit heart curve: (x² + y² − 1)³ − x²y³ ≤ 0 is inside
function inHeart(col: number, row: number) {
  const x = (col + 0.5 - COLS / 2) / HEART_SCALE;
  const y = -(row + 0.5 - ROWS / 2) / (HEART_SCALE * HEART_HEIGHT) + 0.12;
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function isHeartOutline(col: number, row: number) {
  if (!inHeart(col, row)) return false;
  return !(
    inHeart(col - 1, row) &&
    inHeart(col + 1, row) &&
    inHeart(col, row - 1) &&
    inHeart(col, row + 1)
  );
}

// Shade of the primary color: mixes currentColor with white or black
function shade(rand: () => number) {
  const toward = rand() < 0.65 ? "white" : "black";
  const amount = toward === "white" ? rand() * 55 : rand() * 30;
  return `color-mix(in srgb, currentColor ${(100 - amount).toFixed(0)}%, ${toward})`;
}

type Cell = { x: number; y: number; fill: string; opacity: number };

export function HeartDotGrid({ className }: { className?: string }) {
  const cells = useMemo<Cell[]>(() => {
    const rand = mulberry32(SEED);
    const out: Cell[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Always consume the same random numbers so the pattern is stable
        const fill = shade(rand);
        const jitter = 0.7 + rand() * 0.3;

        const outline = isHeartOutline(col, row);

        // Elliptical distance from center: 0 at center, 1 at the edges
        const nx = (col + 0.5 - COLS / 2) / (COLS / 2);
        const ny = (row + 0.5 - ROWS / 2) / (ROWS / 2);
        const d = Math.sqrt(nx * nx + ny * ny);
        const fade = 1 - smoothstep(FADE_START, 1, d);

        const opacity = outline ? 1 : BG_OPACITY * jitter * fade;
        if (opacity < 0.02) continue;

        out.push({
          x: col * PITCH,
          y: row * PITCH,
          fill,
          opacity: Number(opacity.toFixed(3)),
        });
      }
    }
    return out;
  }, []);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`text-primary ${className ?? ""}`}
      role="img"
      aria-label="Heart made of dots"
      xmlns="http://www.w3.org/2000/svg"
    >
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={CELL}
          height={CELL}
          rx={RADIUS}
          fill={c.fill}
          fillOpacity={c.opacity}
        />
      ))}
    </svg>
  );
}
